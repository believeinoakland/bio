# filing-templates (T35)

**Status** · session_01PyDJe4kpvF85uYt49rEyW4 · depth 2 · COMPLETE · handled B1

## Completion (FILING-TEMPLATES #5)

**Entries applied.** T35-63 (N702; K1869): R26. `offeredVersion` also takes `{name, project?, version?, viewer}` in place of `template`:
- `templateHandle(name)` (exported) gives a name's handle: case-folded, each run of characters other than ASCII letters and digits made one `-`, no `-` at either end. A name with no ASCII letter or digit has no handle (null). `TEMPLATE_NAME_REF_RE` (exported) is the form of `name`: `@` and a handle.
- Resolution looks only at templates that are not retired and that the viewer may see (R24). It takes the most specific scope first: the given `project`'s own templates (not widened), then group templates (widened), then the active profiles' templates (R15, named by their kind's label). The first scope that holds the handle answers. R25 then answers that template's version exactly as it would for its id; the tests check this answer by answer.
- Refusals, in order, each writing nothing:
  - `TEMPLATE_REF_REFUSED`: `template` and `name` both given, or neither, or a `name` not of the form.
  - `NO_SUCH_TEMPLATE`: no template with that handle in any scope. This is R25's one answer; a hidden template answers exactly as an absent one.
  - `TEMPLATE_NAME_AMBIGUOUS`: two templates in the first scope that holds the handle. The answer names neither.
  - Then R25's refusals.
- Rows: C-115.45 `TEMPLATE_REF_REFUSED` and C-115.46 `TEMPLATE_NAME_AMBIGUOUS` are in `checks.mjs`, with BOB's translations word for word and `where` naming `#byName`. They await stamp (accepted red 2).
- A call to `offeredVersion` with neither `template` nor `name` now answers `TEMPLATE_REF_REFUSED`, where it used to answer `NO_SUCH_TEMPLATE`, as R26 orders. filings' and wizard-scripts' tests stay green.

**Tests changed.** In `reads.test.mjs`, three new R26 tests:
- the handle and the name's form;
- resolution by scope order, compared answer by answer with the by-id answer, including retired templates passed over, a named `updated` version, R25's refusals after resolution, and writes nothing;
- the refusals in order, with negative controls: hidden and absent give one answer, ambiguity among two profiles' templates, and an earlier scope answering before a later scope's ambiguity.

In `invariants.test.mjs`, R23's row test now counts R26's two C-115 rows beside the moved ones, pins their translations, and adds the new refusals to its answered-refusal sweep. Every other row is still C-125, numbered in order.

**Deferred.** None.

**Found in another module (REPORTed to BOB).**
- `wizard-scripts` (its R2, R12; N702's user): `src/wizard-scripts/index.mjs`:657–659 (`#check`'s `templateOffered`) splits a `{template}` ref on `@`. So the library's `@records-request` reaches `offeredVersion` as `template: ""`, `version: "records-request"`, which now answers `TEMPLATE_REF_REFUSED` and is still not offered. To resolve, it should call `offeredVersion({name: ref, project?, viewer})` for a ref that begins with `@`, keeping the `<id>@<n>` split for an id. That is wizard-scripts' share (P10), for a later START.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` embeds this module's source, so it is stale from this change. BOB regenerates it at L9's close (§14).

**Tests and checks run.**
- `node --test bio-plane/test/m/filing-templates/`: tests 51, pass 51, fail 0. The baseline before the change was 48 pass, 0 fail.
- Every user of `filing-templates`:
  - `filings` 67 pass, 0 fail; `wizard-scripts` 63 pass, 0 fail; `queue-producers` 80 pass, 0 fail; `migrate-released.test.mjs` 1 pass, 0 fail.
  - `affordances` 201 pass, 2 fail (the layer-9 grading tests R3/R7/R12 and R40).
  - `control-plane` 178 pass, 4 fail (R22 families, red 26; R30/R2 converts, red 33; R43 catalogue-end, red 19; R53 routes, red 29).
  - `plane` 107 pass, 8 fail (`ask.test.mjs` ×6, red 22; `sweep.test.mjs` ×2, red 31).
  - Each of those failure lists is identical with this change stashed, so none comes from this job.
- `checks/format.mjs`: 130 modules, 129 requirements files; 0 failures.
- `checks/architecture.mjs` filing-templates: 10 product files, 32 relative imports; 0 failures.
- `checks/coverage.mjs` filing-templates: 26 of 26 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs` filing-templates tranche/T35: 5 files changed; 0 failures.

Size (session_01PyDJe4kpvF85uYt49rEyW4): test runs 6, module lines 1782

## J1 · REPORT

N702's user is not yet wired: wizard-scripts src/wizard-scripts/index.mjs:657-659 (#check's templateOffered) splits a {template} ref on '@', so '@records-request' reaches offeredVersion as template '' and version 'records-request', which now answers TEMPLATE_REF_REFUSED (still not offered). It should call offeredVersion({name: ref, project?, viewer}) for a ref beginning with '@' and keep the <id>@<n> split for an id: wizard-scripts' share (P10), for a later START. Also: bio-plane/dist/bio-plane.bundled.mjs embeds this module's source and is stale from this change, for BOB's regeneration at L9's close (section 14). Details in my record.

## J2 · COMPLETE

T35-63 applied: R26 met (offeredVersion by {name: '@<handle>', project?, version?}: project, then group, then profile scope; TEMPLATE_REF_REFUSED C-115.45, TEMPLATE_NAME_AMBIGUOUS C-115.46 with BOB's translations). filing-templates 51/51 pass; filings 67/67, wizard-scripts 63/63, queue-producers 80/80 pass; affordances, control-plane and plane reds identical with the change stashed (inherited). format, architecture, coverage (26 of 26), ownership (5 files): 0 failures each. Nothing deferred. Record: build/jobs/T35/filing-templates.md.
