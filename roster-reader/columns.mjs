/* `rosterColumns(header, view)` (R6): the roles of a captured roster or payroll table's columns, named
 * from the header words the view supplies (`roster_headers`, each `{role, pattern, basis}`).
 *
 * "ROSTERS STAY TABLES" (ladders §2 PEOPLE). This reads the HEADER only: it never reads, copies or
 * returns a row, so a reader that holds the table reads its rows through these roles, in place. A
 * contact column (phone, address, personal e-mail) is named `contact` so that reader can leave it unread
 * (R4). */
import { vocabulary, vocabRegex } from "../docprofile/registry.mjs";

export const ROLES = Object.freeze(["name", "title", "unit", "start", "end", "as_of", "employee_id", "contact"]);

/** The roles of a header's columns. `header` is the list of the table's header cells as captured. */
export function rosterColumns(header, view) {
  if (!Array.isArray(header))
    return { roster: false, roles: [], why: "no header was given: a table's roles are named from its header cells, a list" };
  const ctx = { view: view && typeof view === "object" ? view : undefined };
  const entries = [];
  let skipped = 0;
  for (const e of vocabulary(ctx, "roster_headers")) {
    const re = ROLES.includes(e.role) ? vocabRegex(e.pattern) : null;
    if (re) entries.push({ role: e.role, re }); else skipped++;
  }
  const roles = header.map((cell, index) => {
    const text = typeof cell === "string" ? cell.replace(/\s+/g, " ").trim() : "";
    if (!text) return { index, header: cell ?? null, role: null, why: "the column has no header text, so no role is named" };
    const hit = [...new Set(entries.filter((x) => { x.re.lastIndex = 0; return x.re.test(text); }).map((x) => x.role))];
    if (hit.length === 1) return { index, header: text, role: hit[0], why: null };
    if (hit.length > 1) return { index, header: text, role: null, why: `its header matches the view's words for more than one role (${hit.join(", ")}), so no role is named by guess` };
    return { index, header: text, role: null,
             why: entries.length ? "no header word in the view names a role for it" : "the view supplies no roster header words, so no column's role can be named" };
  });
  const has = (r) => roles.some((c) => c.role === r);
  const roster = has("name") || has("employee_id");
  return {
    roster,
    roles,
    why: roster ? null : `no column is named \`name\` or \`employee_id\`, so this table is not read as a roster${entries.length ? "" : " (the view supplies no roster header words)"}`,
    ...(skipped ? { skipped_why: `${skipped} roster header entr${skipped === 1 ? "y" : "ies"} in the view name no known role or do not compile, and were not used` } : {}),
  };
}
