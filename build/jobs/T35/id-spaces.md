# id-spaces (T35)

**Status** · session_01VGEWLNunPZ8F4aBDx9uTno · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (T35-7; N639; K1713, K1740).
- R30–R33: `recogniseSeries(view, text)` finds each citation of a policy series' item or a standard designation that the view's `standard_sources` entries with `series` supply (`jurisdictions` R63), answering `{key, series, label, kind, issuer, number, normal, portion?, edition?, start, end, basis, profile}` in reading order. `normal` is the entry's `normal` parts over `cite`'s groups (the same part grammar `recognise` reads, so formatting only is removed, R4), or the `number` group as matched. An `edition` is read only when written (and only on a `standard` entry); none is defaulted. Overlapping matches that read different families or numbers go to `undetermined.ambiguous` with every reading; matches reading one family and number are one citation. A family withheld as a conflict is not read and is named in `undetermined.conflicts`. No series in the view gives `{citations: [], undetermined: {why}}`, saying the profiles supply none; a non-string `text` likewise. Every series, issuer and pattern comes from the view; nothing in the code names one. Never throws.
- DEC-149 sweep: id-spaces has no rows (`plan/draft-T35-dec149-l1-l7.md`, "Modules with nothing to change").

**Reading pending BOB (QUESTION J1).** `jurisdictions` R66 does not fix how a withheld family shows in the view. Coded to: a conflict whose `at` is `standard_sources[<key>/<series.key>]…` (the shape combine gives its other keyed conflicts), or two view entries of one family that differ in label, `cite` or `normal`, or an entry with `series` and no `cite`. Each one withholds the family. If JURISDICTIONS' job reports it another way, that is one small change to `conflictFamily`.

**Improvements made in my module.** None beyond the entry. A series entry whose pattern cannot be compiled (possible only in a view not made by `combine`) is listed in `undetermined.unreadable`, not dropped silently.

**Deferred.** None.

**Found in other modules.** None. Generated artifact made stale (§14): `bio-plane/dist/bio-plane.bundled.mjs` bundles `idspaces.mjs`.
- Tests graft the series onto a combined view (`fixtures.mjs` `withSeries`, the view's own shape with `profile` and `bases`), because `jurisdictions.combine` refuses `series` and kind `standard` until JURISDICTIONS' T35-1 job merges. The graft stays valid after that merge.

**Uses** (unchanged): jurisdictions (the view's shape only; nothing imported), court-citations (its data).

**Tests and checks run** (on `job/T35/id-spaces` at its tranche base cee9b275ea; jurisdictions not yet merged):
- `node --test bio-plane/test/m/id-spaces/`: pass 37, fail 0 (new `series.test.mjs`: R30–R33; R24's export list now names `recogniseSeries`).
- Users of id-spaces: jurisdictions 91/0; court-doctypes 24/0; entities 88/0; calculations 38/0; standards 50 pass, 1 fail (`reads.test.mjs` R29, inherited red 5, not id-spaces').
- `format`: 129 modules, 128 requirements files; 1 failure (test-support's make-zip path, inherited red 13). `architecture id-spaces`: 3 product files, 5 relative imports; 0 failures. `coverage id-spaces`: 32 of 32 live requirement ids named by a test; 0 failures. `ownership id-spaces tranche/T35`: 0 failures.

Size (session_01VGEWLNunPZ8F4aBDx9uTno): test runs 4, module lines 1804

## J1 · QUESTION

R31/R66: how a withheld family appears in the view. jurisdictions R66 does not fix the conflict's `at` or what stays of the entry. My best reading, which I am coding to: combine reports it as `standard_sources[<key>/<series.key>].<field>` (as its other keyed conflicts, e.g. `deadlines[rule/applies_to].f`), and the entry is either dropped or kept without the withheld field. id-spaces treats a family as withheld when a conflict's `at` names standard_sources with that key and series key, when two view entries of one family differ in cite, label or normal, or when an entry with series has no cite; each is named in undetermined.conflicts and not read. If jurisdictions' job chooses another `at`, tell me by CHANGE and I match it. Not blocking.
