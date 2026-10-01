/* action-plans R9–R13, R26: options, their addressees, proposals and adoption, lobbying, dispositions, and the keys no
   plan holds. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, choose, V, MACHINE, by, OFFICE } from "./fixture.mjs";
import { REFUSED_KEYS } from "../../../src/action-plans/index.mjs";

const code = (r) => r.code ?? r.reason;
const add = (w, extra = {}) => w.ap.optionAdd({ plan: w.PL, summary: "Write to the clerk", category: "awareness",
  subjects: [w.S1], ...by("bob"), ...extra });

test("R9: each refusal in order; a legal option with no tier reads undetermined; a revision keeps the prior readable", () => {
  const w = seeded();
  opened(w);
  assert.equal(code(add(w, { author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_ADD_OPTION");
  assert.equal(code(add(w, { plan: "PLN-2026-0999-plan" })), "NO_SUCH_PLAN");
  assert.equal(code(add(w, by("carol"))), "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(code(add(w, { summary: "" })), "OPTION_NO_SUMMARY");
  assert.equal(code(add(w, { summary: "x".repeat(201) })), "OPTION_NO_SUMMARY");
  assert.equal(code(add(w, { detail: "x".repeat(5001) })), "OPTION_DETAIL_TOO_LONG");
  assert.equal(add(w, { detail: "x".repeat(5000) }).ok, true);
  assert.equal(code(add(w, { category: "fundraising" })), "CATEGORY_UNKNOWN");
  assert.equal(code(add(w, { subjects: [] })), "OPTION_NO_SUBJECT");
  assert.equal(code(add(w, { subjects: [w.S2] })), "OPTION_NO_SUBJECT", "a matter the plan is not about");
  assert.equal(code(add(w, { addressee: { state: "named", name: "Jane Doe" } })), "ADDRESSEE_REFUSED");
  assert.equal(code(add(w, { dates: [{ date: "2026-13-01", basis: "the statute" }] })), "DATE_REFUSED");
  assert.equal(code(add(w, { dates: [{ date: "2026-11-01" }] })), "DATE_REFUSED", "no basis");
  assert.equal(code(add(w, { tier: 1 })), "TIER_REFUSED", "a tier on an awareness option");
  assert.equal(code(add(w, { category: "legal", tier: 4 })), "TIER_REFUSED");
  assert.equal(code(add(w, { lobbying: true })), "LOBBYING_NO_REQUIREMENT");
  assert.equal(code(add(w, { budget: 500 })), "OPTION_KEY_REFUSED");
  /* two faults: the earlier answers */
  assert.equal(code(add(w, { summary: "", category: "x" })), "OPTION_NO_SUMMARY");
  assert.equal(code(add(w, { category: "x", budget: 1 })), "CATEGORY_UNKNOWN");
  const legal = add(w, { category: "legal" });
  assert.equal(legal.fields.tier, "undetermined");
  assert.equal(add(w, { category: "legal", tier: 2 }).fields.tier, 2);
  assert.equal(add(w, { category: "legal", tier: "undetermined" }).fields.tier, "undetermined");
  /* optionRevise: R9's rule, with a reason; earlier revisions stay readable */
  assert.equal(code(w.ap.optionRevise({ plan: w.PL, option: legal.option, summary: "New", ...by("bob") })), "PLAN_NO_REASON");
  assert.equal(code(w.ap.optionRevise({ plan: w.PL, option: "opt-99", summary: "New", reason: "r", ...by("bob") })), "NO_SUCH_OPTION");
  assert.equal(code(w.ap.optionRevise({ plan: w.PL, option: legal.option, summary: "", reason: "r", ...by("bob") })), "OPTION_NO_SUMMARY");
  assert.equal(code(w.ap.optionRevise({ plan: w.PL, option: legal.option, reason: "r", author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_ADD_OPTION");
  const rev = w.ap.optionRevise({ plan: w.PL, option: legal.option, summary: "File a complaint", tier: 3, reason: "Counsel advised", ...by("bob") });
  assert.equal(rev.ok, true);
  const o = w.ap.planRead({ id: w.PL, viewer: V("bob") }).options.find((x) => x.id === legal.option);
  assert.equal(o.summary, "File a complaint"); assert.equal(o.tier, 3);
  assert.deepEqual(o.revisions.map((r) => [r.rev, r.fields.summary, r.fields.tier, r.reason]),
    [[1, "Write to the clerk", "undetermined", null], [2, "File a complaint", 3, "Counsel advised"]]);
  assert.equal(w.ap.planClose({ id: w.PL, reason: "r", ...by("bob") }).ok, true);
  assert.equal(code(add(w)), "PLAN_CLOSED");
  assert.equal(code(w.ap.optionRevise({ plan: w.PL, option: legal.option, reason: "r", ...by("bob") })), "PLAN_CLOSED");
});

test("R10: every addressee arm lands; a private individual, or an arm missing its parts, is refused", () => {
  const w = seeded();
  opened(w);
  const arms = [
    [{ state: "named", role: "Town Clerk", body: "City of Port Ellery" }, "office"],
    [OFFICE, "office"],
    [{ state: "named", kind: "press", role: "Reporter", organisation: "The Harbour Gazette" }, "press"],
    [{ state: "named", kind: "organisation", role: "Director", organisation: "Open Records League" }, "organisation"],
    [{ state: "named", kind: "group", role: "Coordinator", organisation: "Friends of the Harbour" }, "group"],
    [{ state: "audience", description: "residents of the harbour district" }, "audience"],
  ];
  for (const [a, arm] of arms) {
    const r = add(w, { addressee: a });
    assert.equal(r.ok, true, arm);
    assert.equal(r.fields.addressee.state, a.state);
    if (arm !== "audience") assert.equal(r.fields.addressee.kind, arm);
  }
  for (const bad of [{ state: "named", name: "Jane Doe" }, { state: "named", kind: "person", role: "x", organisation: "y" },
                     { state: "named", role: "Clerk" }, { state: "named", kind: "press", role: "Reporter" },
                     { state: "audience" }, { state: "undetermined", basis: "b" }, "Jane Doe"])
    assert.equal(code(add(w, { addressee: bad })), "ADDRESSEE_REFUSED", JSON.stringify(bad));
});

test("R11: a proposal is stored apart, labelled, never an option; a member adopts it once; a machine cannot adopt", async () => {
  const w = seeded();
  opened(w);
  const p = await w.ap.optionPropose({ plan: w.PL, summary: "Hold a public meeting", category: "grassroots", subjects: [w.S1],
                                       why: "Residents asked for one", proposer: V("alice"), viewer: V("alice") });
  assert.equal(p.ok, true);
  assert.match(p.says, /not an option/);
  assert.equal(p.proposal.label.state, "member_proposed"); assert.equal(p.proposal.label.machine_work, false);
  assert.equal(p.proposal.why, "Residents asked for one");
  let read = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  assert.equal(read.options.length, 0, "a proposal is never an option");
  assert.deepEqual(read.proposals.map((x) => x.id), [p.proposal.id]);
  assert.equal(code(await w.ap.optionPropose({ plan: w.PL, summary: "s", category: "other", subjects: [w.S1], why: "x".repeat(501),
                                               proposer: V("alice"), viewer: V("alice") })), "PROPOSAL_WHY_REFUSED");
  assert.equal(code(await w.ap.optionPropose({ plan: w.PL, summary: "s", category: "other", subjects: [w.S1], why: "w", viewer: V("alice") })), "PROPOSAL_NO_PROPOSER");
  assert.equal(code(w.ap.optionAdopt({ proposal: p.proposal.id, author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_ADD_OPTION");
  assert.equal(code(w.ap.optionAdopt({ proposal: "PLN-x/proposal/9", ...by("bob") })), "NO_SUCH_PLAN_PROPOSAL");
  assert.equal(code(w.ap.optionAdopt({ proposal: p.proposal.id, ...by("dave") })), "NO_SUCH_PLAN_PROPOSAL", "a plan dave may not see");
  const a = w.ap.optionAdopt({ proposal: p.proposal.id, ...by("bob") });
  assert.equal(a.ok, true); assert.equal(a.proposal, p.proposal.id);
  assert.equal(a.origin, undefined, "a member's proposal carries no assistant origin");
  read = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  assert.equal(read.options[0].proposal, p.proposal.id);
  assert.equal(read.options[0].summary, "Hold a public meeting");
  assert.equal(read.proposals[0].adopted, true); assert.equal(read.proposals[0].adopted_option, a.option);
  const twice = w.ap.optionAdopt({ proposal: p.proposal.id, ...by("bob") });
  assert.equal(code(twice), "PROPOSAL_ADOPTED"); assert.equal(twice.option, a.option);
  /* overrides at adoption go through R9 */
  const p2 = await w.ap.optionPropose({ plan: w.PL, summary: "Another", category: "other", subjects: [w.S1], why: "w", proposer: V("alice"), viewer: V("alice") });
  assert.equal(code(w.ap.optionAdopt({ proposal: p2.proposal.id, category: "nope", ...by("bob") })), "CATEGORY_UNKNOWN");
  assert.equal(w.ap.optionAdopt({ proposal: p2.proposal.id, summary: "Edited", ...by("bob") }).fields.summary, "Edited");
});

test("R12: a lobbying option names in enforces a standard or a determined subject; the module never judges text", () => {
  const w = seeded();
  opened(w);
  w.standard("STD-2026-0001-a");
  assert.equal(add(w, { lobbying: true, enforces: "STD-2026-0001-a" }).ok, true);
  assert.equal(add(w, { lobbying: true, enforces: w.S1 }).ok, true);
  assert.equal(code(add(w, { lobbying: true })), "LOBBYING_NO_REQUIREMENT");
  assert.equal(code(add(w, { lobbying: true, enforces: "STD-2026-0404-none" })), "LOBBYING_NO_REQUIREMENT");
  assert.equal(code(add(w, { lobbying: true, enforces: w.SI })), "LOBBYING_NO_REQUIREMENT", "a suspected subject enforces nothing yet");
  assert.equal(code(add(w, { lobbying: true, enforces: "STD-2026-0001-a", ...by("bob"), viewer: "member:outsider" })), "NO_SUCH_PLAN");
  /* text that reads like lobbying is not judged: only the member's mark asks */
  assert.equal(add(w, { summary: "Lobby the council for a new law", detail: "lobbying" }).ok, true);
});

test("R13: several options disposed in one act, all or none; declined and blocked need a reason; history keeps each", () => {
  const w = seeded();
  opened(w);
  const [a, b, c] = [option(w), option(w, { summary: "Second" }), option(w, { summary: "Third" })];
  assert.equal(code(w.ap.optionDispose({ plan: w.PL, options: [a, "opt-99", b], disposition: "chosen", ...by("bob") })), "NO_SUCH_OPTION");
  assert.equal(w.ap.optionDispose({ plan: w.PL, options: [a, "opt-99", b], disposition: "chosen", ...by("bob") }).option, "opt-99");
  assert.equal(w.ap.planRead({ id: w.PL, viewer: V("bob") }).options.every((o) => o.disposition === "open"), true, "none changed");
  assert.equal(code(w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "maybe", ...by("bob") })), "DISPOSITION_UNKNOWN");
  assert.equal(code(w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "chosen", author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_DISPOSE");
  assert.equal(code(w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "declined", ...by("bob") })), "PLAN_NO_REASON");
  assert.equal(code(w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "blocked", ...by("bob") })), "PLAN_NO_REASON");
  assert.equal(code(w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "chosen", reason: "x".repeat(501), ...by("bob") })), "PLAN_NO_REASON");
  assert.equal(code(w.ap.optionDispose({ plan: w.PL, options: [], disposition: "chosen", ...by("bob") })), "NO_SUCH_OPTION");
  const all = w.ap.optionDispose({ plan: w.PL, options: [a, b, c], disposition: "chosen", ...by("bob") });
  assert.equal(all.ok, true);
  assert.equal(w.ap.optionDispose({ plan: w.PL, options: [b], disposition: "declined", reason: "Too slow", ...by("bob") }).ok, true);
  assert.equal(w.ap.optionDispose({ plan: w.PL, options: [c], disposition: "done", ...by("bob") }).ok, true);
  assert.equal(w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "blocked", reason: "Office closed", ...by("bob") }).ok, true);
  const read = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  const d = Object.fromEntries(read.options.map((o) => [o.id, o]));
  assert.equal(d[a].disposition, "blocked"); assert.equal(d[b].disposition, "declined"); assert.equal(d[c].disposition, "done");
  assert.deepEqual(d[b].dispositions.map((x) => [x.disposition, x.reason]), [["chosen", null], ["declined", "Too slow"]]);
  assert.deepEqual(d[a].dispositions.map((x) => x.disposition), ["chosen", "blocked"]);
  assert.equal(w.ap.optionDispose({ plan: w.PL, options: [a], disposition: "open", ...by("bob") }).ok, true, "back to open");
});

test("R26: each refused key is refused OPTION_KEY_REFUSED; none is stored or answered; an option without them lands", async () => {
  const w = seeded();
  opened(w);
  for (const k of ["budget", "cost", "assignee", "hours", "significance", "priority", "score"]) {
    assert.equal(code(add(w, { [k]: 1 })), "OPTION_KEY_REFUSED", k);
    assert.equal(code(await w.ap.optionPropose({ plan: w.PL, summary: "s", category: "other", subjects: [w.S1], why: "w", [k]: 1,
                                                 proposer: V("alice"), viewer: V("alice") })), "OPTION_KEY_REFUSED", k);
  }
  assert.deepEqual(REFUSED_KEYS, ["budget", "cost", "assignee", "hours", "significance", "priority", "score"]);
  const o = add(w);
  assert.equal(o.ok, true);
  assert.equal(code(w.ap.optionRevise({ plan: w.PL, option: o.option, reason: "r", hours: 3, ...by("bob") })), "OPTION_KEY_REFUSED");
  assert.equal(code(w.ap.optionDispose({ plan: w.PL, options: [o.option], disposition: "chosen", assignee: "bob", ...by("bob") })), "OPTION_KEY_REFUSED");
  choose(w, [o.option]);
  assert.equal(code(w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "n", phases: [{ id: "a", name: "A", options: [o.option], starts: "plan_start", cost: 5 }], ...by("bob") })), "OPTION_KEY_REFUSED");
  const text = JSON.stringify(w.ap.planRead({ id: w.PL, viewer: V("bob") })) + JSON.stringify(w.snapshot());
  for (const k of REFUSED_KEYS) assert.equal(new RegExp(`"${k}"`).test(text), false, k);
});
