/* money's closed vocabularies (requirements: `build/requirements/money.md`, Terms, R1, R17). Each list is frozen; a
   new value is a requirement change, never a write. No word here names a place (R22). */

/** Kind (Terms; R1, R17). */
export const MONEY_KINDS = Object.freeze(["revenue", "expenditure", "transfer", "allocation", "payment", "contribution",
  "gift", "income", "behested", "settlement", "debt", "balance", "fee charged", "other"]);
/** Phase (Terms; R1, R17). */
export const PHASES = Object.freeze(["proposed", "adopted", "adjusted", "actual"]);
/** Stage, for phase `actual` only (Terms; R1, R17). */
export const STAGES = Object.freeze(["encumbered", "incurred", "paid", "assessed", "collected"]);
/** Basis of accounting (Terms; R1, R17). */
export const BASES = Object.freeze(["budgetary", "cash", "modified accrual", "accrual", "undetermined"]);
/** Precision of a figure, `calc-grammar`'s (Terms; R1, R17). */
export const PRECISIONS = Object.freeze(["exact", "rounded", "approximate", "range"]);

/* The stage families, money's closed table (K1505 (10)): the sources name the families only, so which kind takes which
   family is held here. A receipt is assessed, then collected; an outlay is encumbered, incurred, then paid. */
const RECEIPT = Object.freeze(["assessed", "collected"]);
const OUTLAY = Object.freeze(["encumbered", "incurred", "paid"]);
const BOTH = Object.freeze([...OUTLAY, ...RECEIPT]);
export const STAGE_FAMILIES = Object.freeze({
  revenue: RECEIPT, "fee charged": RECEIPT, income: RECEIPT,
  expenditure: OUTLAY, payment: OUTLAY, transfer: OUTLAY, allocation: OUTLAY, settlement: OUTLAY, debt: OUTLAY,
  contribution: BOTH, gift: BOTH, behested: BOTH, balance: BOTH, other: BOTH,
});

/* A fund's type and the balance-class family it names (Terms, `balance_class`; K1505 (10): a fund's type is held in
   money). Governmental funds report fund balance in GASB 54's classes; proprietary and fiduciary funds report net
   position by its components. National reporting standards, not any place's. */
export const FUND_TYPES = Object.freeze(["governmental", "proprietary", "fiduciary"]);
const NET_POSITION = Object.freeze(["net_investment_in_capital_assets", "restricted", "unrestricted"]);
export const BALANCE_FAMILIES = Object.freeze({
  governmental: Object.freeze(["nonspendable", "restricted", "committed", "assigned", "unassigned"]),
  proprietary: NET_POSITION,
  fiduciary: NET_POSITION,
});

/** How a figure was read (R3): a member's typed transcription, or a machine's reading. */
export const METHODS = Object.freeze(["typed", "reader", "ocr", "table_binding"]);
export const MACHINE_METHODS = Object.freeze(["reader", "ocr", "table_binding"]);

/** A money set's purpose (R12). */
export const SET_PURPOSES = Object.freeze(["trail", "attribution"]);
/** The entity kinds a fact may concern (Terms, `concerns`). */
export const CONCERNS_KINDS = Object.freeze(["contract", "fund", "program", "proceeding"]);
/** The change notice's changes (R23). */
export const CHANGES = Object.freeze(["added", "withdrawn", "adjusted", "set_changed"]);

/* R36 (T53; N1260): the connection kinds are five families of the closed fact kinds (R1), not one. Each fact is one hop
   from payer to payee carrying its own `money.kind`; its edge is under exactly one family. The words are the design's by
   key `label.connectionkinds.<kind>` (K1486); money holds provisional plain ones until the design gives them. */
export const CONNECTION_FAMILIES = Object.freeze({
  money_transfer: Object.freeze(["transfer", "allocation"]),
  money_payment: Object.freeze(["expenditure", "payment", "settlement"]),
  money_contribution: Object.freeze(["contribution", "gift", "behested"]),
  money_revenue: Object.freeze(["revenue", "income", "fee charged"]),
  money_other: Object.freeze(["debt", "balance", "other"]),
});
export const CONNECTION_KIND_NAMES = Object.freeze(Object.keys(CONNECTION_FAMILIES));
/** R36: each of the 14 closed fact kinds, to exactly one connection kind. */
export const MONEY_KIND_FAMILY = Object.freeze(Object.fromEntries(
  Object.entries(CONNECTION_FAMILIES).flatMap(([family, ks]) => ks.map((k) => [k, family]))));
/** R36: the fact kinds of a connection kind (empty for a name that is not one). */
export const kindsOfFamily = (connectionKind) =>
  Object.prototype.hasOwnProperty.call(CONNECTION_FAMILIES, connectionKind) ? CONNECTION_FAMILIES[connectionKind] : Object.freeze([]);
/* R36: a set's source-document edge has no fact's kind. */
export const DOCUMENT_EDGE_KIND = "money_other";
