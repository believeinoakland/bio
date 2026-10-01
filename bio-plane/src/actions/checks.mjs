/* actions/checks.mjs — a re-export only (K835; N447 drops it in T20). Its code moved to `action-grammar` in T19 layer 9
 * (K617, K653 BOB-2), where `actions` reads it. This file holds no code and imports no catalogue; it stays for the
 * importers later in the order that read it by this path until their own jobs re-point to action-grammar: control-plane's
 * `CHECK_FAMILY_FILES` (the eight `*_CHECKS` families), instance-setup's `setup.mjs` (`RISK_TIERS`, `riskTierState`),
 * and escalation's tests (`ACTION_CATALOGUE_CHECKS`). */
export { RISK_TIERS, riskTierState, ACTION_FENCE_CHECKS, ACTION_ACT_CHECKS, GOVERNING_LAW_CHECKS, QUOTE_CHECKS,
         LIFECYCLE_CHECKS, RISK_TIER_REVISION_CHECKS, RECORDS_LAW_FENCE_CHECKS,
         ACTION_CATALOGUE_CHECKS } from "../action-grammar/index.mjs";
