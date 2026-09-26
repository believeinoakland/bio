<!-- UNREVIEWED: written by a drafting worker for BOB #38 on 2026-09-26 (P18 preparation) and never reviewed; the membership draft's worker was stopped mid-run when P3 stopped product work. BOB reviews it before it becomes build/requirements/<module>.md. -->
# promotion — extraction report

## 1. Extraction map (measured, `grep -a`-verified line ranges)

| what | where today | lines | moves to `promotion` |
| --- | --- | --- | --- |
| `runGate`, `runCaseGate`, `CATALOG_VERSION`, `GATE_VERSION` | `bio-plane/src/gate.mjs` | whole file, 413 lines | already owned; no move needed |
| `promote(pkg)` method | `bio-plane/src/store.mjs` | 17881-20109 (2,229 lines) | yes — but see §4, only part of this body is properly this module's |
| `reopen({...})` method | `bio-plane/src/store.mjs` | 7984-8250 (267 lines) | yes, cleanly — its only private calls are `#one`, `#caseRelationOf`, `#reevalRaisedBy` (the last two are reevaluation/case-relation reads, layer 7/8 — see §4) |
| op dispatch `promote:` | `bio-plane/src/store.mjs` | 53158-53167 | yes (the scheduler-arm side effects at lines 53159-53166 call `#monitorConfigured`/`#armScheduler`/`#biasDebtPending`, which are scheduler's (layer 10) — flagged in §4, not moved) |
| op dispatch `reopen:` | `bio-plane/src/store.mjs` | 54397-54400 | yes |
| Release-signature primitives (hand-written Ed25519/SSHSIG, "for the C-18.8 release check") | `bio-plane/checks/bio-checks.mjs` | 6120-6571 ("Release-signature primitives") | **retires** once `checkReleaseSignature` (6649-6787ish, the C-18.8 findings) calls `signatures.verifySshsig` instead; the hand-written curve arithmetic (6155-6571) is deleted, not moved |
| `checkReleaseSignature` (C-18.8 findings logic, kept, rewired) | `bio-plane/checks/bio-checks.mjs` | 6649-6787 (approx.) | stays in `legacy-checks` as part of `checkBundle`'s catalogue; `promotion` only changes what it calls into for the crypto |

I did not attempt to line-range the ~25 other check families `promote()` references inline (see §2) or the ~25
private `Store#` methods it calls (see §4) — that would mean reading most of a 2,229-line function's private
dependency closure line by line, which is out of proportion to a draft; I read the function whole for structure,
checks and table writes, and grepped it for every private-method and check-family reference, which is what the
draft's Uses section and this report are built from.

**Tables promote() writes or reads directly** (grepped from its body, `FROM`/`INTO`/`UPDATE` targets): `bundles`,
`files`, `manifest`, `refs`, `history`, `structure`, `retired`, `register` (record-core, layer 2 — clean);
`project_participants`, `project_visibility` (membership, layer 2 — clean); `action_basis`, `action_quotes`,
`correspondence` (actions, layer 9); `ai_run_bounds`, `inquiry_run_surfacings` (ai-runs, layer 6);
`bias_statements`, `bias_adoptions` (bias, layer 5); `entities` (layer 5); `inquiry_basis`,
`inquiry_basis_versions`, `inquiry_basis_version_legs`, `inquiry_exclusions`, `inquiry_migration_replays`
(inquiry, layer 6). This is the single most important finding — see §4.

## 2. bio-checks.mjs checks `promote()`/`reopen()` run today, by C-number

Grepped inline from the two function bodies (not from `checkBundle`, which runs separately at `runGate`):

`promote()`: C-2.1, C-2.5, C-2.8, C-6.1, C-12.1, C-12.2, C-18.5, C-20.1, C-21.2, C-25.10, C-25.11, C-26.12,
C-32.19, C-33.21, C-33.22, C-33.24, C-45.5, C-45.6, C-53.8, C-53.13, C-64.1, C-66.5, C-70.1, C-73.1, C-86.1,
C-86.2, C-86.3, C-86.4, C-90.1 — plus the check families `ACT_SHAPE_CHECKS`, `BASIS_VERSION_CHECKS`,
`BIAS_CHECKS`, `CONTENT_EXTENT_CHECKS`, `PROJECT_CREATION_VISIBILITY_CHECKS`, `PROJECT_ID_CHECKS`,
`PROMOTED_TYPE_CHECKS`, `SUGGEST_CHECKS`, `SURFACE_CHECKS` (imported and referenced by name, not always by
literal C-number at the call site).

`reopen()`: C-2.8, C-4.2, C-13.2, C-21.1, C-32.5.

`runGate`'s `checkBundle` runs the **entire** bundle-format catalogue (every family `bio-checks.mjs` exports for a
bundle), not a subset — that is the whole point of gating once, centrally, rather than re-deriving a subset. I did
not re-enumerate all ~500+ C-numbers; that count belongs to `d470-catalog-census.test.mjs`'s own print (per
`gate.mjs`'s header), not to a hand recount here.

Ruling K6 requires every check to carry with its own id and test, none dropped. Since `promote()`/`reopen()`
already run a mix of families whose *home module* is ambiguous (e.g. `BIAS_CHECKS`, `CONTENT_EXTENT_CHECKS` sound
like bias's/content's own invariants, not promotion's), I have **not** assigned each C-number above to promotion's
own Invariants in the draft — I kept the draft's Invariants to the checks that are unambiguously about the write
mechanism itself (CAS, envelope, digest/size, CITED fence, type/field carry-forward, readability ordering). Which
of the ~29 C-numbers `promote()` currently runs inline are promotion's own invariants versus checks that should
run inline **because a later module asked promotion to run them at commit time** (once that module exists and can
register them) is exactly the §4 question, and I left it for the module job and BOB rather than guess a home for
each one now.

## 3. record-core and membership services this module needs

Since neither is drafted yet, I named only what today's call sites show, in the draft's Uses section:

- **record-core**: generic row read (`#one`, `#rows` equivalents), the bundle-level CAS itself (whether
  record-core owns the CAS primitive and promotion calls it, or promotion owns the CAS and record-core owns only
  storage beneath it, is undetermined — the two modules sit in the same layer and either shape is consistent with
  `layers.md`), id allocation (`allocid`), and the retirement/citation index (`#retirementCitedBy`, the `CITED`
  fence both `retire` and `promote` run).
- **membership**: project ownership/authority (`#isProjectOwner`, `#projectAuthority`,
  `PROJECT_AUTHORITY_CHECKS`), project visibility and its checks, the producing group
  (`#producingGroup`/`#groupUndetermined`), and the testimony/attribution fence (`#testimonyFence`) a promoted
  document's authorship rests on.

I flagged both as **undetermined shape** in the draft rather than inventing method signatures for services that
are themselves being drafted in parallel — writing them here would be exactly the guessing CLAUDE.md §1 forbids.

## 4. Requirements whose meaning differs from today's code, or needs Bob (the important part)

1. **`promote()` is not a layer-2 function as written.** It directly writes tables belonging to layer 5 (bias,
   entities), layer 6 (inquiry, ai-runs) and layer 9 (actions) — see the table list in §1. Under `layers.md`'s
   rule that a layer's modules use only earlier layers, a layer-2 `promotion` cannot itself depend on
   `bias`/`entities`/`inquiry`/`actions` (all later). Two ways to resolve it, and I did not pick one:
   (a) `promotion` exposes a narrow commit primitive (CAS + envelope + its own checks + the record-core tables),
   and every later-layer write currently inline in `promote()` is *left in `legacy-store`* for that construct's
   own job to pull out later, calling back into the new `promotion.promote` as its commit step (this is what the
   draft assumes, and what "extraction runs bottom-up" in PROCESS-MECHANICS §12 seems to intend); or (b) `promote`
   is redesigned as an extension point that later modules register write-behaviour into, so one ACID transaction
   still covers a bundle-format-check plus every construct's projection, without `promotion` importing any of
   them. (b) is a real design change to how the plane commits and is squarely BOB's under §7 of the process
   mechanics ("a change to what a requirement means" / "the architecture at its high level"). I recommend (a) for
   T1 (defer the decision, keep bottom-up extraction working) and raising (b) as a standing question before layer
   5 or later starts extracting, since every later layer's job will otherwise hit the same "my table write lives
   inside promote()" problem in turn.
2. **`op=promote`'s scheduler-arm side effects** (`#monitorConfigured`, `#armScheduler`, `#biasDebtPending`, in the
   dispatch wrapper, not in `promote()` itself) are monitoring/scheduler's (layer 10) concern riding on the same
   dispatch entry. Smaller version of the same problem; I left it out of the draft's Provides and note it here
   rather than invent a hook.
3. **`reopen()`'s two non-local calls**, `#caseRelationOf` and `#reevalRaisedBy`, read case-membership (layer 8,
   `publication`) and reevaluation (layer 7, `reevaluation`) state. `reopen()`'s own scope (R18-R23 in the draft)
   does not need either fact to state the rule; I suspect these are read-only enrichments on the *answer*
   `reopen` returns (telling the caller which dependents are affected), not something `reopen`'s own refusal
   logic depends on, but I did not verify that by reading `#caseRelationOf`/`#reevalRaisedBy` themselves (out of
   budget) — **undetermined**, flagged rather than guessed.
4. **C-18.8's move (K10) is more than swapping one function call.** `bio-checks.mjs`'s own comment block
   (6120-6152) argues the hand-written verifier is deliberate because the gate runs in node, the browser, *and
   Apps Script*, and Apps Script has no WebCrypto Ed25519 — the same reason `signatures.md`'s own Suggestions
   section gives for why nothing calls it from `bio-checks.mjs` today. If Apps Script is still a real target
   runtime for the gate, R26 as I've drafted it (call `signatures.verifySshsig` unconditionally) would break the
   gate there. I flagged this literally in the draft as "not yet met" and did not soften it, but it needs Bob's
   or BOB's confirmation that Apps Script is retired as a gate runtime before a job actually makes this change —
   otherwise K10 needs amending to something conditional (call `signatures` where WebCrypto Ed25519 exists, keep
   a runtime-gated fallback where it doesn't) rather than a straight replacement.

## 5. Rows that belong elsewhere

All 14 rows (D-578, D-546, D-615, D-673, D-628, D-695, D-700, D-692, D-717, D-707, D-718, D-726, D-741, D-738)
are genuinely about "the same promote function" per their own text, except:
- **D-695** is about `app.html`/`setup.mjs` UI controls and a `law` field on action intake — that's
  `legacy-ui`/`actions`, not promotion. I did not fold it into the draft.
- The other 13 are promotion's. None of their fixes are in the current tree (`tranche/T1`): I grepped every
  distinctive string each row names (`PROMOTED_TYPE_UNSTATED`, `STATE_MOVE_UNDECLARED`,
  `ENVELOPE_DATES_DISAGREE`, `PROMOTED_FIELD_UNSTATED`, `REVISION_REDATES_CREATION`, `RECORDS_LAW_REFUSED`,
  `REVISION_REGROUPS_BUNDLE`, `historyWriteOrder`) against `store.mjs` and `bio-checks.mjs` and none is present;
  `gate.mjs`'s `CATALOG_VERSION` is `1.31.0` where these rows cite catalogue versions up to 1.38.0/514 checks.
  This is consistent with PROCESS-MECHANICS §12.5: they are Batch30 work, never landed on `main`, reachable only
  in `snapshot/pre-refactor-2026-09-25`. I marked all 13 *(not yet met)* in the draft and named the row in each
  case, per README rule 5, rather than assume the "integrated" status in the old-plan file describes the tree
  this session is on.

## 6. Undetermined, not guessed

- Whether record-core owns the bundle CAS primitive itself, or promotion does (§3).
- The exact shape record-core's and membership's Provides will state — I read no drafted file for either, since
  none exists yet.
- Whether `#caseRelationOf`/`#reevalRaisedBy` inside `reopen()` are read-only enrichment or load-bearing (§4.3).
- Whether Apps Script is still a gate runtime, which determines whether K10/R26 can be a straight replacement or
  needs a conditional fallback (§4.4).
- The precise boundary between "promotion's own invariant" and "a later module's check promotion currently runs
  inline" for the ~29 inline C-numbers in `promote()` (§2) — I listed them all but assigned only the
  unambiguous ones to the draft's Invariants.

## 7. Requirement id count

28 in Public (R1-R28: 17 for `promote`, 6 for `reopen`, 5 for `runGate`/`runCaseGate`/version constants), plus
5 in Private Invariants (R29-R33) = **33 requirement ids** (`**Rn**`) in the draft, R1-R33, none retired.

Token use: not available to me from within this session (no tool surfaced it); the harness may report it
separately from the transcript.
