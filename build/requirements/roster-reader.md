# roster-reader — requirements

**Status** · DRAFT by a requirements worker for BOB #114, 2026-10-05, on `tranche/T32`, before T33 opens (§5.9), for BOB's review. New module (K1504, Choices 2; scope §2: later readers each in their own sibling module, never back into `docprofile` or `doctypes`), layer 1 after `legistar-reader`. Plan entry T33-15 (B §(d) PEOPLE 2b; C2 row 12, K1484). Every id is not yet met.

**Size (P6).** About 500–800 lines.

## Public

### Purpose

Reads rosters, organisation charts and staff directories for who is in an organisation and in which post, as the documents state it. A roster or chart is read as content and a roster table's columns are named, so `people.staffingAt` can read rosters as tables through its roster source, never copied into lines. A name read from a staff directory is a person reference that can match only at grade C.

### Provides

**Two content types, `{key, contract: MEMBERSHIP, detect, parse, assess}`**, registered through `docprofile`'s registry seam (`registerRosterTypes(register)`), after `doctypes`' types and before `generic`.
- **R1** `staff_roster`: a document whose body is a list of one organisation's people or posts, with names and titles but no contact points (the shape `staff_directory` cannot see: its header names a board roster and a committee roster). `detect` is CERTAIN only with both a self-naming line (the view's roster words, `jurisdictions` vocabulary under this key) and at least a floor of name-and-title lines (a measured structural floor, in code); LIKELY with the lines alone; no match otherwise. A document `staff_directory` or a dated schedule matches is not matched (the dated-rows rule of `staff_directory`, applied here).
- **R2** `staff_roster` `parse` gives `rows`: one per entry, `{name, title?, unit?, source}`, as the line states them; `as_of` the document's own stated date where a line states one, else `null` with why; and `organisation` as its title line names it. A line it cannot divide into a name and a title is kept whole as `line`, never paired by guess.
- **R3** `org_chart`: a document naming an organisation's units and posts in chart form. `parse` gives `units` and `posts` as read (`{label, source}`), names beside posts where the text places them on the same line, and a `reports_to` pair only where the text itself states the relation in words; a chart's boxes and lines, which text does not carry, give no pair, and `pairs_why` says so.
- **R4** Neither type reads or emits a phone number, street address or personal e-mail address; a roster row carrying one is read without it (K1485 row 9, K1493).
- **R5** `assess` compares two readings by row (a name with its title and unit): a row gone gives `delisted`, a row added `item_added`, a title or unit moved `item_changed`, from `site-profiles`' catalogue only.

**rosterColumns(header, view) → `{roles, why}`**
- **R6** Names the roles of a captured roster or payroll table's columns, `name`, `title`, `unit`, `start`, `end`, `as_of`, `employee_id`, from the header words the view supplies; a column no word matches has no role; a table with no `name` and no `employee_id` column is not a roster, with why. Contact columns (phone, address, personal e-mail) are named `contact` so a reader can leave them unread. The table's rows are never copied (ladders §2 PEOPLE, "Rosters stay tables").

**directoryPersonRefs(entities) → `[{contact_key, name?, match_grade, why}]`**. `entities` are a `staff_directory` reading's `contact` entities.
- **R7** For each contact entry the reference stays keyed by its address (`contact_key`), and the person's name is read from the entry's `line` only when, with the address, phone and title words removed, exactly one name-shaped span remains; otherwise no `name`, with why (a two-column line may hold two people's text). A name read here carries `match_grade: "C"`, a name alone, and can never resolve a person above grade C (K1484 row 12; K1488).

## Private

### Uses

- `docprofile`: the registry seam, `CONTRACT`, `CONFIDENCE`, `entity`, `diffEntities`, `flatten`, `selfNaming`, the reader view and `ctx.locate`; through it `site-profiles`' event catalogue.
- `jurisdictions` (through the view): roster self-naming words, roster header words and title vocabulary, under this module's keys.

### Invariants

- **R8** No place in code; tested against the test profile and the first profile.
- **R9** Each type is written from real documents fetched and read through the plane, named in its own header, and tested on them with the `staff_directory` header's four negatives (the candidate contact list, the dated meeting schedule, the business directory, the board roster as a positive here), never from what a roster probably looks like (the registry's standing rule).
- **R10** Everything read is a reading of what the document states: no post, holder, reporting line or identity is written; lines and identity claims are proposed elsewhere and adopted by a member (K1443, K1452).
- **R11** Every "no" (no match, no name, no pair, no role) says which kind of no and why.

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 PEOPLE ("Rosters stay tables"), §5A.4 L2–L3 (the roster and org-chart reader after the split; `staffingAt` through `registerRosterSource`), §5.4 (staff posts from directories and org charts, read by name), §10 (the people doctrine row: the staff directory stays keyed by address, the name read as a match graded C).
- Rulings K1443, K1452, K1484 (row 12), K1485 (row 9).

### Suggestions

- **For `calculations` and `people`**: the roster source `calculations` registers for `staffingAt` reads a captured table with R6's roles; that edge (`calculations` or `people` using `roster-reader`) is not in the plan's `uses` and is BOB's to add.
- **For `entities`**: the grade-C ceiling of R7 is the resolution cascade's (a name alone is C); entities applies it to a reference R7 produces.
- The fixtures are in the bucket the staff directory was measured on (`staff-directory.mjs` header: a board roster, a committee roster, org charts); the job fetches and captures them.
