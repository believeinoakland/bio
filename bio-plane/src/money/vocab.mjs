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

/* The members' words (K1486): money words by context, a followed flow a "money trail". The connection kind's word. */
export const CONNECTION_KIND = "money_flow";
export const CONNECTION_WORD = "money";
