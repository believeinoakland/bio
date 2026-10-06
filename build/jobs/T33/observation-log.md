# observation-log (T33)

**Status** · session_011eCf41FhGTDYps24foMo53 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two details of T33-30, with my best reading; I am building on it and do not need an answer to finish. Answer only if either is wrong.

1. **R34, the tail.** `idPattern('LEAD')` is `^LEAD-\d{4}-\d{4,}$` (sequential); a lead's `MMDD` fits the counter. I compose the tail after it as today's validator does, `-[a-z0-9]+`, not narrowed to the minted `[0-9a-f]{12}`. Reason: `inquiry-grammar`'s C-54.1 reads `LEAD_ID_RE` to refuse a lead in a leg by name, so narrowing the tail would stop it refusing some lead-shaped ids it refuses today; keeping it changes nothing for any id valid before T33. The mint stays `LEAD-YYYY-MMDD-<12 hex>` (R14).

2. **R35, the sight class.** `declareTable` has no class that says R13 or R15 exactly. I declare `observation_log` as `sight: source` (a row's sight is that of the captures and bundles it names, R13; a lead or objective row is withheld by R13 on top), and `leads` and `lead_shares` as `sight: owner` (the author; R15's reach through a share is this module's read, never wider than the class). Purge: `observation_log` and `leads` `clear` with `keys: []` (whole store only), `lead_shares` `clear` keyed by `bundle_id` (both forms, R23). `version_chain: true` for the log only; every other class as `declarePurge`'s default (`expunge none`, `export admin-only`, `derive stored`). A refused declaration throws at start, as `sources` does.
