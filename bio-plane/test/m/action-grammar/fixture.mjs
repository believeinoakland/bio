/* action-grammar's test helpers: `suite(api)`, which runs every function and reads every value the module provides over
   the corpus (`corpus.mjs`) and answers it as plain JSON, and `GOLDEN`, the same suite's answer over the code before the
   move (`golden.json`; how it was recorded is in `corpus.mjs`' header). No network, no record; the time is `NOW`. */
import { readFileSync } from "node:fs";
import { DOCS, KIND_SETS, SCALARS, NOW, TODAY } from "./corpus.mjs";

/* R7 (K1444 (iii); T33-72): the audit reads a clock entry's past date on the office's local day, `ctx.zone`. The golden
   file was recorded when it read the UTC day, so the suite hands it `UTC` (a zone, not a place), on which the local day is
   the UTC day and every finding is the recorded one; the local day in other zones is R7's own tests'. */
export const ZONE = "UTC";

/* K899 (1) (T20 layer 9): text a member reads says "record" where the code before the move said "bundle"; T34-87
   (DEC-149) re-words three more. Each old phrase with its new one; the golden file stays as recorded and is compared with
   these applied, so no other byte of it moves. */
export const REWORDED = [
  ["' is not a canonical bundle id", "' is not a canonical record id"],
  ["point the edge at the ACTN- bundle whose correspondence this answers", "point the edge at the ACTN- record whose correspondence this answers"],
  /* T34-87 (DEC-149, K1811): a member reads "your group's Civicsmith" where three sentences said "the plane" or "this
     instance": `requestLifecycleOf`'s `says` (R8), C-2.10's kind finding (R7) and C-101.1's translation (R9). */
  ["The plane derives only the days", "Your group's Civicsmith derives only the days"],
  ["' is not a kind this instance offers", "' is not a kind your group's Civicsmith offers"],
  ["An action is one of the kinds this instance offers:", "An action is one of the kinds your group's Civicsmith offers:"],
];
const RECORDED = readFileSync(new URL("./golden.json", import.meta.url), "utf8");
export const GOLDEN = JSON.parse(REWORDED.reduce((text, [was, now]) => text.split(was).join(now), RECORDED));
/** How many times each old phrase occurs in the golden file as recorded (so a test can say every one was re-worded). */
export const REWORDED_COUNTS = REWORDED.map(([was]) => RECORDED.split(was).length - 1);

/** JSON's view of a value, so a comparison with the golden file sees exactly what it holds. */
export const plain = (v) => (v === undefined ? { undefined: true } : JSON.parse(JSON.stringify(v)));
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
/** The findings `fn(findings)` pushes; it must answer nothing. */
export function pushed(fn) {
  const findings = [];
  const answer = fn(findings);
  return { findings: plain(findings), answered: answer !== undefined };
}

/** The values the module provides by name (R2, R8's bounds), and its rows (R9). */
export const VALUE_NAMES = ["ACTION_KINDS", "PRODUCT_KINDS", "ACTION_BASIS_KINDS", "CORRESPONDENCE_DIRECTIONS", "RESOLUTIONS",
  "CORRESPONDENCE_STAGES", "CORRESPONDENCE_OUTCOMES", "DECISION_STAGES", "LIFECYCLE_KEYS", "QUOTE_KEYS", "RISK_TIERS",
  "RFC_RESPONSE_WINDOW_PRECEDENT", "LAW_LEVELS", "RECORDS_LAW_MAX", "ADDRESSEE_KINDS", "AUDIENCE_DESCRIPTION_MAX",
  "RISK_TIER_REASON_MAX", "RISK_TIER_HISTORY_MAX", "GOVERNING_LAWS_MAX", "CITATION_MAX", "LAW_PROPOSAL_WHY_MAX",
  "DUE_UNDETERMINED_SAYS"];
export const ROW_NAMES = ["ACTION_FENCE_CHECKS", "ACTION_ACT_CHECKS", "GOVERNING_LAW_CHECKS", "QUOTE_CHECKS", "LIFECYCLE_CHECKS",
  "RISK_TIER_REVISION_CHECKS", "RECORDS_LAW_FENCE_CHECKS", "ACTION_CATALOGUE_CHECKS"];

/** Every reader and arm over one document, as `actions` calls them. */
export function overDoc(api, fm) {
  const d = () => clone(fm);
  const entries = Array.isArray(fm?.correspondence) ? fm.correspondence : [];
  const audit = {};
  for (const [k, kinds] of Object.entries(KIND_SETS))
    audit[k] = pushed((f) => api.checkActionExtension({ fm: d(), nowMs: NOW, zone: ZONE, ...(kinds ? { actionKinds: kinds } : {}) }, f)).findings;
  return {
    audit,
    actionBasis: pushed((f) => api.actionBasisFindings(d(), f)).findings,
    correspondence: pushed((f) => api.correspondenceFindings(d(), f)).findings,
    quotes: entries.map((_, i) => plain(api.quoteFindings(clone(entries), i))),
    lifecycle: entries.map((_, i) => plain(api.lifecycleFindings(clone(entries), i))),
    recordsLawRefusal: plain(api.recordsLawRefusal(d())),
    recordsLawFindings: pushed((f) => api.recordsLawFindings(d(), f)).findings,
    recordsLawOf: [null, "member:a", "token:agent"].map((a) => plain(api.recordsLawOf(d(), a))),
    riskTierHistoryOf: plain(api.riskTierHistoryOf(d())),
    governingLawsOf: plain(api.governingLawsOf(d())),
    requestLifecycleOf: plain(api.requestLifecycleOf(d(), TODAY)),
    consequenceState: plain(api.consequenceState(d())),
    counterpartyFindings: pushed((f) => api.counterpartyFindings(d(), f)).findings,
    respondsTo: pushed((f) => api.respondsToEdgeFindings(d(), f)).findings,
  };
}

/** The whole suite: values, rows, every document, every scalar reader. */
export function suite(api) {
  const docs = {};
  for (const [id, fm] of Object.entries(DOCS)) docs[id] = overDoc(api, fm);
  const S = SCALARS;
  return {
    values: Object.fromEntries(VALUE_NAMES.map((n) => [n, plain(api[n])])),
    rows: Object.fromEntries(ROW_NAMES.map((n) => [n, plain(api[n])])),
    docs,
    scalars: {
      riskTierState: S.riskTierState.map((v) => plain(api.riskTierState(clone(v)))),
      quoteValue: S.quoteValue.map((v) => plain(api.quoteValue(v))),
      isQuoteEntry: S.isQuoteEntry.map((v) => api.isQuoteEntry(clone(v))),
      lawProposalLabel: S.lawProposalLabel.map((v) => plain(api.lawProposalLabel(v))),
      kindReadsAsWritten: S.kindReadsAsWritten.map((v) => api.kindReadsAsWritten(v)),
      actionKinds: S.actionKinds.map((v) => plain(api.actionKinds(clone(v)))),
      counterparty: S.counterparty.map((cp) => ({ office: plain(api.counterpartyOffice(clone(cp))),
        name: plain(api.counterpartyName(clone(cp))), isOffice: api.addresseeIsOffice(clone(cp)) })),
      clockMoves: S.clockMoves.map(([a, b, t]) => plain(api.clockMovesNotMechanical(clone(a), clone(b), t))),
    },
  };
}
