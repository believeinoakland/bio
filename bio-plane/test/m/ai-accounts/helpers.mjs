/* Shared by ai-accounts' tests: the refusal shapes, the acts, and the worlds the arms stand in. Every one drives the
   module at its interface; none builds another module's answer. */
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { AI_ACCOUNT_CHECKS } from "../../../src/ai-accounts/index.mjs";

/* a refusal as its fields in order (ok, reason, code, check, translation), and what a refusal of `code` is by its row: compared as lists,
   so no test builds a refusal of another shape by hand */
export const shape = (r) => [r.ok, r.reason, r.code, r.check, r.translation];
export const refusal = (code) => [false, code, code, AI_ACCOUNT_CHECKS[code].check, AI_ACCOUNT_CHECKS[code].translation];
export const act = (kind, member, project) => ({ kind, member, ...(project !== undefined ? { project } : {}) });
export const ask = (member, project) => act("ask", member, project);
export const DEFAULTS = { ask: true, draft: true, run: true, standing: false, explore: "no", enquire: true, read: true, transcribe: true, account: true, suggestions: false };

/* ann owns P (hidden) with bob joined; cy owns S alone (hidden); dee owns D (discoverable) alone; eve is an active member
   in nothing; second an administrator; the founder claimed. */
export async function projectWorld(opts) {
  const w = await world(opts).group("ann", "bob", "cy", "dee", "eve");
  w.project("P", "ann");
  assert.equal(w.join("P", "ann", "bob").ok, true);
  w.project("S", "cy");
  w.project("D", "dee", "discoverable");
  return w;
}

/* an account set, and switched on: `w.own`, `w.team`, `w.projectAccount` answer the set; these also switch it */
export async function on(w, set) {
  const r = await set;
  assert.equal(r.ok, true, JSON.stringify(r));
  const by = r.owner === "group" ? "admin" : r.owner.startsWith("project:") ? { P: "ann", S: "cy", D: "dee" }[r.owner.slice(8)] : r.owner.slice(7);
  assert.equal(w.a.accountSwitch({ account_id: r.account_id, on: true, by }).ok, true);
  return r;
}

/* R2, R64: every place a secret could leak, searched: each table's rows (except where a column is named as the one that may
   hold the sealed text), and any answer given. Returns the places the sentinel was found, `table.column` or `answer`. */
export function leaks(w, sentinel, { allow = ["ai_accounts.sealed"], answers = [] } = {}) {
  const found = [];
  const enc = (s) => [s, Buffer.from(s).toString("base64"), Buffer.from(s).toString("hex")];
  const needles = enc(sentinel);
  for (const { name } of w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`))
    for (const r of w.rows(`SELECT * FROM "${name}"`))
      for (const [col, v] of Object.entries(r))
        if (v !== null && needles.some((n) => String(v).includes(n)) && !allow.includes(`${name}.${col}`)) found.push(`${name}.${col}`);
  for (const a of answers) if (needles.some((n) => JSON.stringify(a ?? null).includes(n))) found.push("answer");
  return found;
}
