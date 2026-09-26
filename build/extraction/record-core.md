# record-core — extraction map

**Status** · Measured 2026-09-26 by a drafting worker for BOB #38 (P18), reviewed by BOB. Line ranges are in `bio-plane/src/store.mjs` and `schema.mjs` at that date; the extraction job confirms them. BOB's rulings on its open questions are K23 in `build/rulings.md`.


## 1. Extraction map (function/table/op → record-core, with line ranges measured in this session)

`bio-plane/src/store.mjs` (54,618 lines):
- `allocId(prefix, year)` — line 32038-32040
- `allocIdOp(prefix, year)` — line ~32046-32060 (the `op=allocid` door; C-59.5 refusal region marked
  `DEC-49 REGION is-allocid-prefix-gated`)
- `#nextSeq(prefix, year)` — the sequence step itself, ~32062-32070
- `#mintProjectId(title)` — ~32076-32086 (see Suggestions: may belong to `promotion` instead)
- `static GATED_ID_PREFIXES` — the fixed list `["PROJ","CASE","DRAFT","RVG","TASK"]`
- `static UNTAILED_GATED_PREFIXES` — `["CASE","DRAFT","RVG"]`
- `#mintOpaqueId(prefix, year, tail, taken)` — ~32149-32166
- `static #MINT_LEDGER_LIVE` — the seed table list, ~32170-32180
- `#seedMintLedger()` — runs at every boot, ~32185-32217
- `acquireLease(bundleId, actor, ttlMs)` — 32219-32267
- `#rows`, `#one` — small SQL helpers used throughout, 16179-16180 (generic; every module's job will use
  its own copy or a shared helper — not specific to record-core but not owned by any later module either;
  flagged as undetermined, see §4)
- `readFile(bundleId, path)` — 16184-16188 (approx; adjacent to `#one`)
- `Store.snapPath(path, snapKey)` — static, the canonical `_history/...` path derivation, ~16205-16217
- `readImage(bundleId)` — 17196-17245
- `auditPass({after, limit, viewer})` — 16233-16456 (async; calls `checkBundle` from legacy-checks)
- `purge({bundleId})` — 33975-34668 (by far the largest single method touching record-core's share; see
  §3 below — most of its body clears OTHER modules' derived tables, not record-core's own)

The `INSERT`s that actually write `files`, `history`, `manifest` and `bundles` on a promotion are NOT in
a record-core function today — they are inline inside `promote()` itself, at approximately lines
19289-19363 of store.mjs (`INSERT INTO manifest ...` ×2, `INSERT INTO history ...`, `DELETE FROM
files ... / INSERT INTO files ...`, `INSERT INTO bundles ...`). Extracting record-core cleanly means
giving these rows their own write primitives here that `promotion` calls, rather than leaving them as
raw SQL inside `promote()`. This is stated as a Suggestion in the draft, not a requirement, since it is
an extraction/ownership decision (BOB's, under P17) rather than a behaviour change.

`bio-plane/src/schema.mjs` (4,287 lines) — tables moving to record-core:
- `bundles` (5-18), `files` (34-42), `history` (45-56), `manifest` (57-74), `leases` (109-115),
  `seq` (117-120), `minted_ids` (143-147).

Two tables were measured and NOT included, flagged as undetermined for BOB:
- `refs` (76-83) — references extracted from frontmatter, generic storage in one sense, but the
  reference/cascade MODEL (typed edges, cascade semantics) is State Rules §5, arguably a later module's
  (`content`/`connections`) concern; record-core would only hold the table.
- `register` (85-107) — "the trust root … capture_sha is the only thing that proves bytes." Comment
  language and its column set (author, observed_at, MK-1 testimony flag) point at provenance/capture
  (layer 3: `provenance`, `capture`), not record-core, even though `purge` clears it beside `leases`.
Both are left out of this draft's Provides/Uses; naming them wrongly would be guessing. Recommend BOB
rule explicitly which module owns `refs` and `register` before the extraction job starts (`purge`
currently clears both alongside record-core's own tables, in both purge arms — see §3).

## 2. bio-checks.mjs checks taken as invariants (K6)

Only one check in the ~16,591-line catalogue is clearly keyed to a record-core function today:
- **C-59.5 / `ALLOCID_PREFIX_GATED`** (`allocIdOp > is-allocid-prefix-gated`) — carried as R3/R25.

I searched the catalogue for checks tied to `acquireLease`, `purge`, `mintOpaqueId`/`#seedMintLedger`,
`readImage`/history/manifest, and `#nextSeq`/`seq`, and found none by name (`where:` lines naming those
functions). The refusals `ANONYMOUS_LEASE` and `MINT_EXHAUSTED` are real, coded behaviour (carried as
R10/R28 and R9) but are NOT catalogued C-numbers in bio-checks.mjs — they are inline store refusals with
no check entry. Per K6 ("every check in bio-checks.mjs moves … as an invariant with its own id"), this
means record-core's invariant set is thin by the letter of that ruling (one check), while its behaviour
set is not — the module still has real rules (R25-R29), they are just not all check-catalogue-derived.
Flagged for BOB in case this changes how "invariant" vs. "requirement" is drawn for this module, or in
case checks for these functions exist under names I did not search for.

C-59.1–C-59.4 (the sibling `PROJECT_ID_*` checks in the same catalogue block) were measured and
EXCLUDED: they guard `promote()`'s handling of a caller-supplied project id and are `promotion`'s share
(the write path), not record-core's, even though `PROJECT_ID_CHECKS` sits in the same source region as
C-59.5.

C-67.1 (`SNAP_KEY_TAKEN`, `promote > is-promote-snapkey`) was also measured and excluded for the same
reason: it guards `promote()`'s write into `history`/`manifest`, which is `promotion`'s write-path
concern, even though the tables it protects are record-core's.

## 3. Requirements whose meaning differs from today's code, or from canon — flagged for BOB

**(a) R17 / `readImage` manifest ordering does not meet State Rules I-20 as amended by D-674.** The
old-plan row D-674 (`docs/development/transition/old-plan/QUEUE-2026-09-25.txt` line 607, and its
completion D-700 at line 794) rules that `manifest.created` is the writer's own timestamp, never a
caller-chosen key, and that "prior" (I-20) means write order (`rowid`), never the caller-chosen
`snap_key`'s lexical order — "whose lexical order is not a clock." Both rows are marked `status:
integrated` in the old plan. But `readImage` (store.mjs line ~17240) still does:
```
entries.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
```
sorting the manifest entries it hands back by `snap_key` TEXT, with no write-order (`rowid`/`created`)
field carried at all — exactly the ordering D-674/I-20 rules against. Either the "integrated" status in
the old-plan file does not describe this branch's tree, or the fix landed somewhere I did not find and
was later lost. This is a measured discrepancy between a "status: integrated" row and the code on
`tranche/T1`, not a guess — I read the function whole and grepped for `historyWriteOrder`/`rowid` uses
near it and found none. Stated as a requirement (R17) with a `(not yet met: ...)` flag rather than
silently matched to today's behaviour, per the drafting rule.

**(b) `Store.fetch`'s outer catch still returns a stack trace to the caller — the exact defect D-629
names, on a row marked integrated.** D-629 (same file, line 321): "THE STORE ANSWERS ANY THROWN ERROR
WITH ITS STACK... so file paths, line numbers and constraint text reach a caller." Its own row is marked
`status: integrated`, and a follow-on row (D-679, line 640) references it as already fixed ("since D-629
it at least carries a named code, not a stack"). But the code today (store.mjs line 54608-54611) is:
```
} catch (e) {
  return Response.json({ ok: false, error: String(e && e.stack || e) }, { status: 500 });
}
```
— still exactly the stack-leaking shape D-629 describes. I did NOT fold this into record-core's
requirements: `Store.fetch` is the dispatch/response envelope, which `build/layers.md` ruling K3 assigns
to `control-plane` ("`control-plane` keeps only routing, authentication and the response envelope"), even
though the old-plan row names "owner RECORD." This is a real, measured discrepancy between a plan row
marked done and the tree, and an ownership question (record-core vs. control-plane) the new module split
changes from what the old plan assumed. Flagged for BOB / for whichever module's job picks up this row
under the new architecture — it is not this draft's requirement because `record-core`'s share is
storage, not the response envelope.

**(c) `purge`'s single method reaches far past record-core's share.** Measured: the method (lines
33975-34668) clears at least 40+ tables across nearly every later-layer module (entities, connections,
progressions, ai_runs, leads, themes, bias debts, capture_requests, and more), reported back in one
`removed: {...}` object. Only `files`, `history`, `manifest`, `register`, `leases` (and the `bundles` row
itself) are record-core's own. This draft states record-core's requirements (R22-R24) as the module's OWN
share only, and leaves the rest as a Suggestion for BOB: either each later module gets its own purge
participation (called from record-core's orchestration, or from a shared purge entry point outside any
one module), or `purge` as a whole becomes a cross-cutting mechanism that is not fully "owned" by
record-core the way the layer contract's wording ("owns … purge") might otherwise suggest. This is a
change-of-meaning question (what does the layer contract's word "purge" bind, one module's tables or the
whole corpus's), not a wording ambiguity BOB delegated to routine cleanup — it may need Bob.

**(d) N10 (jurisdiction profiles as an instance setting) is not reflected anywhere in record-core's
current requirements or code, and I found no `bundles`/settings row holding "active jurisdiction
profiles" in schema.mjs.** N10 (`build/plan/next.md` line 33) names record-core, installer and
instance-setup jointly; this draft does not add a requirement for it because I found no existing
storage primitive for instance-level settings in the tables measured as record-core's own (`bundles`
carries per-bundle rows, not instance settings), and inventing one would be guessing at a shape BOB has
not yet decided. Left undetermined — flagged in §4 rather than guessed into an R-id.

## 4. Undetermined (stated, not guessed)

- Whether `refs` and `register` belong to record-core, to a layer-3 module (`provenance`/`capture`), or
  split (record-core keeps the table, another module defines what goes in it) — see §1.
- Where an instance-level "active jurisdiction profiles" setting (N10) should live in record-core's
  schema; no such column or table exists today under any name I found.
- Whether `#mintProjectId` stays in record-core (as a thin, generic wrapper) or moves wholly to
  `promotion` (which is the only caller, and which owns `PROJ`'s creation) — see Suggestions.
- Whether `#rows`/`#one` (small SQL helpers used everywhere in store.mjs) should become a record-core
  service other modules call, or a shared low-level helper outside any one module's requirements — I did
  not find a ruling on shared, no-state SQL helpers of this kind and did not invent one.
- Whether the D-629/D-674 discrepancies (§3a, §3b) reflect a different tree than the one the old-plan
  file describes, or a regression after the row was marked integrated; I did not have a way to check the
  old-plan file's own commit history against this checkout in the time available, so I report the
  discrepancy as measured on THIS tree rather than asserting which explanation is true.

## 5. Requirement id count

R1 through R29 — **29 requirement ids** in this draft (Provides R1-R24 public; Invariants R25-R29
private). All are stated fresh (draft, pre-approval), so none are marked retired.

## 6. N40: the censuses (amendment by a drafting worker for BOB #43, 2026-09-26)

Measured on `tranche/T3` @ `566bb7f811` (`store.mjs` 49,817 lines). The contract is R56–R58 (K72 (12), N40).

**The claim checked.** Both censuses read only this module's tables. `digestCensus` reads `files` (`bundle_id, path, content, blob_sha, bytes, sha256`) and `history` (`bundle_id, snap_key, path, content, blob_sha, sha256`). `snapKeyCensus` reads `manifest` (`bundle_id, snap_key, base, files_json`) and `bundles` (`bundle_id, row_version`). Neither writes. `snapKeyCensus` relies on `row_version` being stepped by one per commit and by nothing else, and on `manifest` having one writer: both hold, since `commit` (`record-core/index.mjs` 343 and 357) is the only writer of either in the product. The claim is true. What the two use beyond the tables is a digest helper (`createSha256`, from `legacy-checks`, already this module's use), `safeJson` (a one-line store helper) and `EMPTY_STRING_SHA` (a store constant that only `snapKeyCensus` reads).

| what | where today | lines | moves |
| --- | --- | --- | --- |
| `EMPTY_STRING_SHA` | store | 685 | yes; its only readers are `snapKeyCensus` (33324, 33329). `promotion` exports its own (`promotion/index.mjs` 32) |
| `safeJson` | store | 858 | a copy; 40 other readers in the store keep it |
| the REC-175 header and `#fileDigestOf`, the REC-178 header and `#inlineBytesOf` | store | 32935–32951 | yes, as the exported `fileDigestOf` and `inlineBytesOf` (R58). The census is their only reader in the store |
| the REC-175 census header and `digestCensus` | store | 32953–32989 | yes (R56) |
| the REC-176 header and `#manifestFiles` | store | 33284–33291 | yes (R57). The census is its only reader in the store (`#samePromotion`, named in its comment, is now `promotion`'s `samePromotion`) |
| the REC-176 census header and `snapKeyCensus` | store | 33292–33347 | yes (R57) |
| dispatch `snapkeycensus` with its comment | store `fetch` | 48534–48535 | delegates to `recordOf(this.ctx).snapKeyCensus` |
| dispatch `digestcensus` with its comment | store `fetch` | 49748–49749 | delegates to `recordOf(this.ctx).digestCensus` |

**Measured size moving in:** about 125 lines from `store.mjs` (about 90 of code), and the two delegating dispatch lines stay as `ADDED` lines in `legacy-store`.

**What stays.** The `OPS` rows `snapkeycensus` (index 892) and `digestcensus` (index 1215, with its comment to 1219) are `control-plane`'s. `homeCensus` (store 33348–) and `registerAudit` read provenance's `register` and are not this module's; the brief's range 32936–33400 spans them and the membership delegates between, which do not move.

**Conflicts.**
1. **One computation, two copies.** REC-175 and REC-178 made `#fileDigestOf` and `#inlineBytesOf` the one computation for the door and the census. T3's promotion job gave `promotion` its own `fileDigestOf` and `inlineBytesOf` (`promotion/index.mjs` 63–72), so there are two today. `record-core` is earlier than `promotion` and cannot import it; R58 puts the one computation here and `promotion` imports it. That is a change to `promotion` (a `next.md` entry), not something this job can make, since `promotion` is not in its `from`.
2. **Tests.** `rec175-digest.test.mjs`, `rec176-snapkey.test.mjs` and `rec178-bytes.test.mjs` load `src/index.mjs` as the Worker script and reach the censuses through their ops; they stay green while the routes delegate. Their negative-control comments name `src/store.mjs` sites that move, and `legacy-tests` re-anchors those.

## Token use

Not available to me in this session (no running total surfaced by the tools I have); not reported rather
than guessed.
