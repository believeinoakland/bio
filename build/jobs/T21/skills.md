# skills (T21)

**Status** · session_012nL6TyhBgmCzjj3jNz5SiT · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R30 and R1. With `templatepropose` published, R30 reads the five member-only acts 'as R28's are'. R1 lists a throw for R28's half-published catalogue (an act R28 names missing while `optionpropose` is published) but names no such throw for R30. My best reading, which I am building: R30's 'as R28's are' carries R28's rule, so with `templatepropose` published and one of `templatedraft`, `templaterevise`, `templatesubmit`, `templatereview`, `templateapprove` not published, renderPack throws naming that act (and its defining requirement) and renders nothing: a half layer is never rendered as a whole one. If you rule otherwise (e.g. carry the missing act as a stated absence), I'll change it; R1's text may want the R30 arm added either way.

## J2 · REPORT

Stale generated artifact: my change edits `bio-plane/src/skillpack.mjs` and `bio-plane/src/skilldoctrine.mjs`, so the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`) is stale (owner `not_product`; regenerate in `bio-plane/`: `npm run build`). I regenerated nothing. No other module's artifact is touched (agent-worker's bundle takes no skills input since T18, manifest).

## J3 · COMPLETE

**Entries applied.**
- K921, K927, K962 (R30; R5's `filing_drafting`): `skilldoctrine.mjs` gains `FILING_RULES` (§4 rules 1, 7, 11, 13; 1 and 13 are `ACTION_RULES`' own objects, 7 and 11 quoted as spans of their paragraphs, canon sentences only), `FILING_TEMPLATE_ACTS` (`templatepropose` filing-templates R6; member-only `templatedraft` R3, `templaterevise` R4, `templatesubmit` R7, `templatereview` R9, `templateapprove` R10, each id named once as a selector, R23), `FILING_TEMPLATE_ACT` and `filingDraftingLayer(catalog)`: `authored`, `load_when` "the run proposes a filing template's wording, or critiques one in a comment"; a stated absence in R9's form while no `templatepropose` is published; with it, a missing member act throws naming it (R1's R30 arm, K962). `skillpack.mjs` places it in `disclosed` after `action_planning` (R5) and adds `SOURCING.filing_drafting` / `filing_drafting_unpublished`.
- N469: `skillpack.mjs`:258's live claim naming `civicos-ui/check-refusal-codes.mjs` re-worded to R7 and its test in `test/m/skills/`. Re-scan of my paths found two more live claims of a suite no test makes (`skilldoctrine.mjs` "the suite PRINTS how many clauses are instruction-only", "the suite prints the residue every run"): re-worded to what the R15 and R17 tests hold. `doctrine.test.mjs`:169's "Converted from" stays (provenance). No "battery" prose in my paths.

**`not yet met: T21` marks met:** R5's `filing_drafting`; R30.

**Deferred:** none.

**Other modules:** none found. Stale artifact reported in J2 (plane bundle).

**Tests and checks** (after merging tranche/T21 @ 39fac2d174):
- `node --test bio-plane/test/m/skills/`: pass 44, fail 0 (new `filing.test.mjs`: R30 R5, R30 acts, R30 R1, R30 R9 absence + version, R30 R16 R24 R26; `pack.test.mjs` R5 order updated).
- `node --test bio-plane/test/m/control-plane/affordances-pack.test.mjs` (renders the pack): pass 2, fail 0.
- format: 0 failures · architecture skills: 0 failures · coverage skills: 30 of 30 live ids named, 0 failures · ownership skills tranche/T21: 0 failures.

Size (session_012nL6TyhBgmCzjj3jNz5SiT): test runs 5, module lines 1806
