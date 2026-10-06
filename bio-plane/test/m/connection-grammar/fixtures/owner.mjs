/* A sample owner of connections, written the way an owner's job would write one, with switches that break one rule
   of the neighbours contract each, so the battery (R9) and the registry's read (R6–R8) can be shown to catch it. */
import { validAt } from "../../../../src/civil-time/index.mjs";
import { derivedId, DECLARED_LABEL, HUNCH_LABEL } from "../../../../src/connection-grammar/index.mjs";

export const NODE = "ENT-2026-0001";
export const HUB = "ENT-2026-9999";
export const INQUIRY = "INQ-2026-0001-a-question";
export const AT = { value: "2026-03-01", precision: "day", zone: "America/Los_Angeles" };
export const KINDS = [
  { kind: "sample_tie", word: "tied to", class: "evidentiary" },
  { kind: "sample_mention", word: "mentioned together", class: "derived" },
  { kind: "sample_said", word: "said to be linked", class: "declared" },
  { kind: "sample_guess", word: "a hunch about", class: "hunch" },
];
const ZONE = "America/Los_Angeles";
export const valid = (from, to) => ({ from, to, precision: "day", zone: ZONE });
const IN = valid("2025-01-01", "2027-01-01");

export function tie(id, from, to, v = IN, extra = {}) {
  return { id, from, to, kind: "sample_tie", owner: "sample", valid: v, evidence: [{ source: "INFO-2026-0001-a-source" }],
    grade: { assertion: "B", ends: ["A", "B"] }, derived: null, ...extra };
}
export function mention(from, to, v = IN) {
  const d = { method: "co-mention", inputs: ["INFO-2026-0001-a-source"], as_of: "2026-02-01" };
  return { id: derivedId({ kind: "sample_mention", from, to, as_of: d.as_of, method: d.method }), from, to, kind: "sample_mention",
    owner: "sample", valid: v, evidence: [], grade: { assertion: "C", ends: ["B", "C"] }, derived: d };
}
export function said(id, from, to, v = IN) {
  return { id, from, to, kind: "sample_said", owner: "sample", valid: v, evidence: [], grade: { assertion: "D", ends: ["B", "B"] },
    derived: null, label: DECLARED_LABEL };
}
export function guess(id, from, to, scope = INQUIRY, v = IN) {
  return { id, from, to, kind: "sample_guess", owner: "sample", valid: v, evidence: [], grade: null, derived: null, label: HUNCH_LABEL, scope };
}

/** The owner's held connections, each with who may see it (`seen_by`, absent for everyone). */
export function held() {
  const rows = [
    tie("c-in", NODE, "ENT-2026-0002"),
    tie("c-out", NODE, "ENT-2026-0003", valid("2020-01-01", "2021-01-01")),
    tie("c-undetermined", "ENT-2026-0004", NODE, valid("2025-01-01", null)),
    { ...tie("c-fenced", NODE, "ENT-2026-0005"), seen_by: ["alice"] },
    mention(NODE, "ENT-2026-0006"),
    said("c-said", NODE, "ENT-2026-0007"),
    guess("c-guess", NODE, "ENT-2026-0008"),
  ];
  for (let i = 0; i < 250; i++) rows.push(tie(`c-bulk-${String(i).padStart(4, "0")}`, NODE, `ENT-2026-${String(1000 + i)}`));
  for (let i = 0; i < 1001; i++) rows.push(tie(`h-${String(i).padStart(4, "0")}`, HUB, `ENT-2026-${String(3000 + i)}`));
  return rows;
}

/** The fixture that goes with `held()`. */
export function fixture() {
  const visible = held().filter((c) => (c.from === NODE || c.to === NODE) && c.id !== "c-out");
  return { node: NODE, at: AT, in: "c-in", out: "c-out", undetermined: "c-undetermined", viewers: { sees: "alice", blind: "bob" },
    fenced: "c-fenced", expected: visible.map((c) => c.id), scope: INQUIRY, hunch: "c-guess", hub: { node: HUB, at: AT } };
}

/**
 * An owner's `neighbours`; `broken` names the one rule it breaks.
 * @param {string} [broken]
 */
export function makeNeighbours(broken) {
  const rows = held();
  let calls = 0;
  const strip = ({ seen_by, ...c }) => c;
  return function neighbours({ node, kinds, at, page, viewer, scope }) {
    calls++;
    if (broken === "async") return Promise.resolve({ items: [] });
    if (broken === "throws") throw new Error("the store is closed");
    if ((viewer === undefined || viewer === null) && broken !== "viewer") return { refused: "VIEWER_MISSING", why: "no viewer" };
    let set = [];
    for (const c of rows) {
      if (c.from !== node && c.to !== node) continue;
      if (Array.isArray(kinds) && !kinds.includes(c.kind) && broken !== "kinds") continue;
      if (c.seen_by && !c.seen_by.includes(viewer) && broken !== "sight") continue;
      if (c.kind === "sample_guess" && c.scope !== scope && broken !== "scope") continue;
      const v = validAt({ valid: c.valid }, at);
      if (v === "out" && broken !== "out") continue;
      const item = strip(c);
      set.push(v === "in" || broken === "unmarked" ? item : { ...item, undetermined: { why: v.why ?? "undetermined" } });
    }
    if (broken === "label") set = set.map((c) => (c.kind === "sample_said" ? { ...c, label: undefined } : c));
    if (broken === "derived") set = set.map((c) => (c.kind === "sample_mention" ? { ...c, id: "not-the-derived-id" } : c));
    if (broken === "foreign") set.push({ ...tie("c-foreign", node, "ENT-2026-0099"), kind: "another_kind" });
    if (broken === "nodeless") set.push(tie("c-nodeless", "ENT-2026-0098", "ENT-2026-0099"));
    set.sort((a, b) => (a.id < b.id ? -1 : 1));
    if (broken === "nondeterministic" && calls % 2) set.reverse();
    if (set.length > 1000 && broken !== "hub" && broken !== "fanout") {
      if (broken === "partialhub") return { items: set.slice(0, 10), hub: { set_size: set.length, why: "a hub" } };
      return { items: [], hub: { set_size: set.length, why: "more than 1000 connections" } };
    }
    const size = broken === "fanout" ? 1500 : 100;
    const start = typeof page === "number" ? page : 0;
    const items = set.slice(start, start + size);
    const end = start + size;
    if (broken === "paging" && start > 0) return { items: items.slice(1) };
    return end < set.length ? { items, next: end } : { items };
  };
}
