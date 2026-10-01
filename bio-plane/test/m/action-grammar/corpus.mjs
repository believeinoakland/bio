/* action-grammar's test corpus: action documents and scalar inputs that drive every arm the module holds (C-2.10's leg,
   ledger, quote, lifecycle, kind, law, tier, counterparty, governing-law, tier-history and resolution arms; C-6.1's
   `responds_to` arm; C-11.1; the readers). `golden.json` holds what the code answered for each before the move: it was
   recorded on `job/T19/action-grammar` before any edit outside `src/action-grammar/`, by running `fixture.mjs`' `suite`
   over the old faces (`src/actions/checks.mjs`, which re-exported the catalogue's vocabularies and grammars, with the
   catalogue's `ACTION_KINDS` beside it) and writing its answer as JSON. The tests run the same `suite` over this module
   and compare (K585 (2)). */

export const NOW = Date.parse("2026-07-02T12:00:00Z");
export const TODAY = "2026-07-02";

const INFO = "INFO-2026-0001-source";
const INFO2 = "INFO-2026-0002-memo";
const INQ = "INQ-2026-0003-question";
const INQ2 = "INQ-2026-0004-second";
const ACTN = "ACTN-2026-0005-earlier";
const SHA = "a".repeat(64);
const OFFICE = { state: "named", role: "Clerk", body: "the Board" };
const CLOCK = { text: "reply due", description: "the reply is due", date: "2026-08-01", basis: "the group's stated window", status: "pending" };
const HIST_AT = "2026-06-01T10:00:00Z";

/** A clean action of each product kind; every case below is one of these with one part changed. */
const base = (o = {}) => ({
  object_type: "action", action_kind: "records_request", risk_tier: 2, counterparty: { ...OFFICE },
  action_basis: [{ target: INFO, kind: "rests_on" }, { target: INQ, kind: "advances" }],
  clock: [{ ...CLOCK }], current_state: "active", ...o,
});
const sent = (o = {}) => ({ direction: "sent", at: "2026-06-01", artifact_sha: SHA, ...o });
const recv = (o = {}) => ({ direction: "received", at: "2026-06-10", account: "they called", author: "member:a", ...o });
const ledger = (...entries) => base({ correspondence: entries });
const hist = (...h) => h.map(([prior, tier, o = {}]) => ({ tier, prior, by: "member:a", at: HIST_AT, reason: "read again", ...o }));
const laws = (list, o = {}) => base({ governing_laws: list, governing_laws_by: "member:a", governing_laws_at: HIST_AT, ...o });

export const DOCS = {
  "clean-records-request": base(),
  "clean-other": base({ action_kind: "other" }),
  "not-an-action": { object_type: "inquiry", action_kind: "nonsense", counterparty: "to be named" },
  "no-object-type": { action_kind: "records_request" },

  /* action_basis (C-2.10 legs; C-54.1; C-81.1; DEC-13) */
  "leg-not-object": base({ action_basis: [null, "x", [1]] }),
  "leg-bad-target": base({ action_basis: [{ target: "not-an-id", kind: "rests_on" }] }),
  "leg-on-action": base({ action_basis: [{ target: ACTN, kind: "rests_on" }] }),
  "leg-bad-kind": base({ action_basis: [{ target: INFO, kind: "because" }] }),
  "leg-lead": base({ action_basis: [{ target: "LEAD-2026-0001-hunch", kind: "rests_on" }] }),
  "leg-theme": base({ action_basis: [{ target: "THEME-2026-0001-lens", kind: "rests_on" }] }),
  "leg-theme-key": base({ action_basis: [{ target: INFO, kind: "rests_on", theme: "THEME-2026-0001-lens" }] }),
  "leg-not-list": base({ action_basis: "INFO-2026-0001-source" }),
  "rfc-clean": base({ action_kind: "request_for_comment", action_basis: [{ target: INQ, kind: "advances" }, { target: INQ2, kind: "advances" }] }),
  "rfc-no-inquiry": base({ action_kind: "request_for_comment", action_basis: [{ target: INQ, kind: "rests_on" }, { target: INFO, kind: "advances" }] }),
  "rfc-no-clock": base({ action_kind: "request_for_comment", clock: [] }),
  "rfc-nothing": base({ action_kind: "request_for_comment", action_basis: [], clock: undefined }),

  /* correspondence (C-2.10 ledger) */
  "ledger-clean": ledger(sent(), recv(), { direction: "no_response", at: "2026-06-20", account: "nothing came", author: "member:b" }),
  "ledger-not-entries": ledger(null, "x", [1]),
  "ledger-bad-direction": ledger(sent({ direction: "outbound" })),
  "ledger-bad-date": ledger(sent({ at: "June" }), sent({ at: undefined })),
  "ledger-both": ledger(sent({ account: "and a summary", author: "member:a" })),
  "ledger-neither": ledger({ direction: "sent", at: "2026-06-01" }),
  "ledger-bad-sha": ledger(sent({ artifact_sha: "sha256:zz" }), sent({ artifact_sha: `sha256:${SHA}` }), sent({ artifact_sha: SHA.toUpperCase() })),
  "ledger-no-response-sha": ledger({ direction: "no_response", at: "2026-06-01", artifact_sha: SHA }),
  "ledger-account-no-author": ledger(recv({ author: " " })),

  /* quotes (C-72.1–C-72.5) */
  "quote-clean": ledger(sent(), recv({ quote_amount: "1,083.00", quote_currency: "USD", quote_basis: "12 hours", quote_answers: "0" }),
                        recv({ quote_amount: "0", quote_currency: "USD", quote_answers: 0, quote_revises: "1" })),
  "quote-on-sent": ledger(sent({ quote_amount: "10", quote_currency: "USD" })),
  "quote-bad-amount": ledger(sent(), recv({ quote_amount: "ten", quote_currency: "USD", quote_answers: "0" }),
                             recv({ quote_amount: "1,00", quote_currency: "USD", quote_answers: "0" }), recv({ quote_amount: "-5.5", quote_currency: "$", quote_answers: "0" })),
  "quote-no-currency": ledger(sent(), recv({ quote_amount: "10", quote_currency: " ", quote_answers: "0" })),
  "quote-answers-nothing": ledger(sent(), recv({ quote_amount: "10", quote_currency: "USD", quote_answers: "5" }),
                                  recv({ quote_amount: "10", quote_currency: "USD", quote_answers: "1" }), recv({ quote_amount: "10", quote_currency: "USD" })),
  "quote-revises-nothing": ledger(sent(), recv({ quote_amount: "10", quote_currency: "USD", quote_answers: "0", quote_revises: "0" }),
                                  recv({ quote_amount: "10", quote_currency: "USD", quote_answers: "0", quote_revises: "x" }),
                                  recv({ quote_amount: "10", quote_currency: "USD", quote_answers: "0", quote_revises: "" })),

  /* the records-request lifecycle (C-94.1–C-94.9) */
  "lifecycle-clean": ledger(sent({ stage: "request" }),
    recv({ stage: "acknowledgement", follows: "0", due_by: "2026-06-30", due_cite: "Records Act s.1" }),
    recv({ stage: "denial", follows: "1", outcome: "denied", exemptions: "s.4(b)" }),
    sent({ stage: "appeal", follows: "2", due_by: "2026-06-01", due_cite: "Records Act s.9" }),
    recv({ stage: "appeal_decision", follows: "3", outcome: "affirmed" })),
  "lifecycle-stage-direction": ledger(sent({ stage: "denial" }), recv({ stage: "request" }), { direction: "no_response", at: "2026-06-03", account: "none", author: "member:a", stage: "request" }),
  "lifecycle-follows": ledger(sent({ stage: "request" }), recv({ stage: "acknowledgement" }), recv({ stage: "production", follows: "7" }), recv({ follows: "x" })),
  "lifecycle-appeal": ledger(sent({ stage: "request" }), recv({ stage: "acknowledgement", follows: "0" }), sent({ stage: "appeal", follows: "1" })),
  "lifecycle-outcome": ledger(sent({ stage: "request", outcome: "granted" }), recv({ outcome: "maybe" }), sent({ exemptions: "s.4" }),
    recv({ stage: "fee_waiver_decision", follows: "0" }), recv({ stage: "court_decision", follows: "0", outcome: "none_stated" })),
  "lifecycle-fee-estimate": ledger(sent({ stage: "request" }), recv({ stage: "fee_estimate", follows: "0" }),
    recv({ stage: "fee_estimate", follows: "0", quote_amount: "5", quote_currency: "USD", quote_answers: "0" })),
  "lifecycle-due": ledger(sent({ stage: "request", due_by: "2026-07-01" }), sent({ due_cite: "s.1" }), sent({ due_by: "soon", due_cite: "s.1" })),

  /* the kinds (C-2.10; actions R10, R4, R41) */
  "kind-unknown": base({ action_kind: "petition" }),
  "kind-legacy": base({ action_kind: "cpra_request" }),
  "kind-profile": base({ action_kind: "bylaw_complaint" }),
  "kind-absent": base({ action_kind: undefined }),

  /* the records law (C-2.10, C-73.6) */
  "law-clean": base({ law: "Records Act s.1" }),
  "law-on-other": base({ action_kind: "other", law: "Records Act s.1" }),
  "law-too-long": base({ law: "x".repeat(201) }),
  "law-unwritable": base({ law: "the \"act\"" }),
  "law-not-text": base({ law: 7 }),
  "law-blank": base({ law: "  " }),
  "law-empty": base({ action_kind: "other", law: "" }),
  "law-null": base({ action_kind: "other", law: null }),

  /* the risk tier (C-2.10, D-182) */
  "tier-string": base({ risk_tier: "2" }),
  "tier-four": base({ risk_tier: 4 }),
  "tier-undetermined": base({ risk_tier: "undetermined" }),
  "tier-absent": base({ risk_tier: undefined }),

  /* the counterparty (C-2.10, D-130, R9's arms) */
  "cp-placeholder": base({ counterparty: " To Be Named " }),
  "cp-bare": base({ counterparty: "City Clerk" }),
  "cp-missing": base({ counterparty: undefined }),
  "cp-array": base({ counterparty: ["x"] }),
  "cp-bad-state": base({ counterparty: { state: "maybe" } }),
  "cp-legacy-name": base({ counterparty: { state: "named", name: "City Clerk", entity_id: "ENT-2026-0007" } }),
  "cp-office-half": base({ counterparty: { state: "named", role: "Clerk" } }),
  "cp-office-org": base({ counterparty: { ...OFFICE, organisation: "The Paper", level: "city" } }),
  "cp-office-explicit": base({ counterparty: { ...OFFICE, kind: "office", level: "county", entity_id: "ENT-2026-0001" } }),
  "cp-press": base({ counterparty: { state: "named", kind: "press", role: "editor", organisation: "The Paper" } }),
  "cp-press-no-org": base({ counterparty: { state: "named", kind: "press", role: "editor" } }),
  "cp-group-no-role": base({ counterparty: { state: "named", kind: "group", organisation: "Neighbours" } }),
  "cp-org-extra": base({ counterparty: { state: "named", kind: "organisation", role: "director", organisation: "A Fund", body: "x", name: "y", level: "city" } }),
  "cp-bad-kind": base({ counterparty: { state: "named", kind: "person", role: "x" } }),
  "cp-bad-entity": base({ counterparty: { ...OFFICE, entity_id: "ENT-1" } }),
  "cp-audience": base({ counterparty: { state: "audience", description: "residents of the district" } }),
  "cp-audience-empty": base({ counterparty: { state: "audience" } }),
  "cp-audience-long": base({ counterparty: { state: "audience", description: "y".repeat(501) } }),
  "cp-audience-unwritable": base({ counterparty: { state: "audience", description: "a \"b\"" } }),
  "cp-audience-named": base({ counterparty: { state: "audience", description: "readers", role: "editor", entity_id: "ENT-2026-0001" } }),
  "cp-undetermined": base({ counterparty: { state: "undetermined", basis: "the office is not yet known" } }),
  "cp-undetermined-empty": base({ counterparty: { state: "undetermined" } }),
  "cp-undetermined-named": base({ counterparty: { state: "undetermined", basis: "x", name: "Clerk", body: "Board" } }),
  "cp-placeholder-field": base({ counterparty: { state: "undetermined", basis: "to be named" } }),

  /* the governing laws (C-2.10, D-149) */
  "laws-clean": laws([{ level: "state", citation: "Records Act s.1" }, { level: "city", citation: "Bylaw 4" }]),
  "laws-local": laws([{ level: "local", citation: "Ordinance 2" }]),
  "laws-attributed-empty": base({ governing_laws: [], governing_laws_by: "member:a" }),
  "laws-at-only": base({ governing_laws_at: HIST_AT }),
  "laws-not-list": laws("Records Act"),
  "laws-too-many": laws(Array.from({ length: 13 }, (_, i) => ({ level: "state", citation: `s.${i}` }))),
  "laws-bad-entries": laws([null, { level: "galactic", citation: " " }, { level: "federal", citation: "c".repeat(201) }]),
  "laws-no-by": laws([{ level: "state", citation: "s.1" }], { governing_laws_by: undefined }),
  "laws-machine-by": laws([{ level: "state", citation: "s.1" }], { governing_laws_by: "token:agent" }),
  "laws-bad-at": laws([{ level: "state", citation: "s.1" }], { governing_laws_at: "yesterday" }),
  "laws-legacy-kind": base({ action_kind: "cpra_request" }),

  /* the tier history (C-2.10, REC-214) */
  "hist-clean": base({ risk_tier: 3, risk_tier_history: hist([2, 1], [1, 3]) }),
  "hist-empty": base({ risk_tier_history: [] }),
  "hist-not-list": base({ risk_tier_history: "1 then 2" }),
  "hist-too-long": base({ risk_tier: 2, risk_tier_history: Array.from({ length: 201 }, (_, i) => ({ tier: i % 2 ? 2 : 1, prior: i % 2 ? 1 : 2, by: "member:a", at: HIST_AT, reason: "r" })) }),
  "hist-unreadable": base({ risk_tier_history: [null, { tier: 2 }, { tier: "undetermined", prior: 1, by: "m", at: HIST_AT, reason: "r" }] }),
  "hist-machine": base({ risk_tier: 1, risk_tier_history: hist([2, 1, { by: "token:agent" }]) }),
  "hist-bad-at": base({ risk_tier: 1, risk_tier_history: hist([2, 1, { at: "2026-06-01" }]) }),
  "hist-long-reason": base({ risk_tier: 1, risk_tier_history: hist([2, 1, { reason: "r".repeat(501) }]) }),
  "hist-same": base({ risk_tier: 2, risk_tier_history: hist([2, 2]) }),
  "hist-broken": base({ risk_tier: 3, risk_tier_history: hist([2, 1], [2, 3]) }),
  "hist-not-current": base({ risk_tier: 2, risk_tier_history: hist([2, 1]) }),
  "hist-from-undetermined": base({ risk_tier: 1, risk_tier_history: hist(["undetermined", 1]) }),

  /* the resolution (C-2.10, REC-39) */
  "resolved-none": base({ current_state: "resolved" }),
  "resolved-bad": base({ current_state: "resolved", resolution: "gave_up" }),
  "resolved-completed": base({ current_state: "resolved", resolution: "completed" }),

  /* the clock (C-11.1) */
  "clock-shape": base({ clock: [null, { text: "t" }, { ...CLOCK, description: "" }] }),
  "clock-date": base({ clock: [{ ...CLOCK, date: "Aug 1" }, { ...CLOCK, date: undefined }] }),
  "clock-basis": base({ clock: [{ ...CLOCK, basis: " " }, { ...CLOCK, basis: 5 }] }),
  "clock-status": base({ clock: [{ ...CLOCK, status: "late" }] }),
  "clock-past-due": base({ clock: [{ ...CLOCK, date: "2026-07-01" }, { ...CLOCK, date: "2026-07-02" }, { ...CLOCK, date: "2026-06-01", status: "overdue" }] }),
  "clock-not-list": base({ clock: "soon" }),

  /* C-6.1's responds_to arm (REC-24 (g)) */
  "refs-clean": { object_type: "information", references: [{ target: ACTN, rel: "responds_to" }, { target: INFO, rel: "cites" }, null] },
  "refs-bad": { object_type: "information", references: [{ target: INQ, rel: "responds_to" }, { target: "ACTN-1", rel: "responds_to" }, { rel: "responds_to" }] },
  "refs-not-list": { object_type: "information", references: "ACTN" },

  /* the consequence (DEC-14) */
  "consequence-outcome": base({ consequence: { claim: "outcome", description: " a hearing was held ", at: "2026-06-30" } }),
  "consequence-default": base({ consequence: { description: "x" } }),
  "consequence-unproven": base({ consequence: { claim: "impact", description: "they changed it" }, action_basis: [{ target: INQ, kind: "advances" }] }),
  "consequence-own-artifact": base({ consequence: { claim: "impact" }, action_basis: [{ target: INFO, kind: "rests_on" }, { target: ACTN, kind: "rests_on" }],
                                     correspondence: [recv({ artifact_bundle_id: INFO })] }),
  "consequence-established": base({ consequence: { claim: "impact", at: "2026-06-30" }, action_basis: [{ target: INFO, kind: "rests_on" }, { target: INFO2, kind: "rests_on" }],
                                    correspondence: [recv({ artifact_bundle_id: INFO })] }),
  "consequence-not-block": base({ consequence: ["impact"] }),
};

/** The instance kinds `checkActionExtension` is handed (actions R10): none (the product's), the product's, and the
 *  test profile's view (jurisdictions' `test-port-ellery`, R11). */
export const KIND_SETS = {
  none: undefined,
  product: ["records_request", "request_for_comment", "other"],
  "test-profile": ["records_request", "request_for_comment", "other", "bylaw_complaint", "commitment_claim"],
};

export const SCALARS = {
  riskTierState: [undefined, null, "undetermined", 1, 2, 3, 0, 4, "1", "2", 1.5, "", [], {}],
  quoteValue: [undefined, null, "", "0", "10", "1,083.00", "1083.00", "-5.5", "1,00", "12,3456", " 7 ", "1.", ".5", "ten", 42, 1e21],
  isQuoteEntry: [null, undefined, "quote_amount", [], {}, { quote_amount: "1" }, { quote_x: 0 }, { direction: "received" }],
  lawProposalLabel: [undefined, null, "", "member:a", "token:agent", "class:agent", "agent"],
  kindReadsAsWritten: [undefined, null, 5, "cpra_request", "grand_jury", "other", "request_for_comment", "petition", "CPRA_REQUEST"],
  actionKinds: [undefined, null, {}, { action_kinds: "x" },
    { action_kinds: [{ kind: "bylaw_complaint" }, { kind: "records_request" }, null, { kind: 5 }, { kind: "bylaw_complaint" }, { label: "x" }] }],
  counterparty: [undefined, null, "Clerk", ["x"], { state: "named" }, { state: "named", name: " City Clerk " },
    { state: "named", role: "Clerk", body: "the Board", level: "city", entity_id: "ENT-2026-0001" }, { state: "named", body: "the Board" },
    { state: "named", role: "Clerk" }, { state: "named", kind: "office", role: "Clerk", body: "Board", name: "ignored" },
    { state: "named", kind: "press", role: "editor", organisation: "The Paper" }, { state: "named", kind: "press", role: "editor" },
    { state: "named", kind: "person", role: "x", organisation: "y" }, { state: "audience", description: "readers" },
    { state: "undetermined", basis: "x" }, { state: "named", name: "  " }],
  clockMoves: [
    [[{ status: "pending", date: "2026-07-01" }], [{ status: "overdue", date: "2026-07-01" }], "2026-07-02"],
    [[{ status: "pending", date: "2026-07-02" }], [{ status: "overdue", date: "2026-07-02" }], "2026-07-02T09:00:00Z"],
    [[{ status: "pending", date: "2026-07-01" }], [{ status: "met", date: "2026-07-01" }], "2026-07-02"],
    [[{ status: "overdue", date: "2026-07-01" }], [{ status: "pending", date: "2026-07-01" }], "2026-07-02"],
    [[{ status: "pending", date: "bad" }], [{ status: "overdue" }], "2026-07-02"],
    [[{ status: "met" }, { status: "pending" }], [{ status: "met" }], "2026-07-02"],
    [[], [{ status: "pending" }], "2026-07-02"],
    [null, undefined, "2026-07-02"],
    [[null, "x"], [{ status: "met" }, null], "2026-07-02"],
  ],
};
