# contradiction (T7)

**Status** · session_01CNWDMUKyWAYEbbdCmSKxyK · depth 2 · WORKING · handled B3

## J1 · QUESTION

**Read contracts for the pairing's joins (map §3: "each to a service or a stated read contract, BOB decides which").**

The pairing (R5–R11) must stay bounded in SQL, one statement per key (and per K3 arm) reading one row past the bound, with the viewer gate compiled into the same statement (R7's observed `truncated`; D-365, `derivation-bounds`). That cannot be done through per-row services, so my best reading is: contradiction joins the tables below in its own SQL, and each owner states them as a read contract, as record-core R37, content R45 and extraction R58 do. None of the owners' Provides states them today. I am building on this reading now; nothing here is written, only read.

Proposed Provides text, one line per owner:

- **inquiry** (new R): "The table `inquiry_basis` and its columns `bundle_id`, `ord`, `role`, `target_id`, `content_id` and `note`, and the column `bundles.inquiry_subject_entity` (the inquiry's subject entity as R12 records it, null or empty for none), are a stated read contract: a later module may join them in its own SQL (`contradiction`'s K1, K4 and its ladder), and this module changes none of their names, types or meanings without a change to this requirement. Every write to them stays this module's."
- **basis-versions** (new R): "The tables `inquiry_basis_versions` (`bundle_id`, `name`, `state`, `hidden`, `claim`) and `inquiry_basis_version_legs` (`bundle_id`, `name`, `ord`, `target_id`, `target_type`, `content_id`) are a stated read contract on the same terms (`contradiction`'s K2, K3, K4 and its ladder)."
- **entities** (new R, its own Suggestion made Provides): "The table `resolutions` and its columns `capture_sha`, `entity_id` and `established` (1 exactly when R34 holds of the grade) are a stated read contract on the same terms (`contradiction`'s K4 and its ladder)."

Extraction needs no change: I read `readings.capture_sha` and `content_type` by R58, and the reading's top-level `date` through `readingOf` (R30).

If you would rather these be services, say which; the SQL bound is the reason I did not propose that.
