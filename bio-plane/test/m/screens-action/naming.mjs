/* screens-action's tests of an office a member names from Request (R20, R57): a scripted plane for the tests that check what the screen SENDS
   (the office's label, where requests go, the law) and how it draws a refusal; where the owner's own answer is what the screen draws, the tests use the
   real providers (`fix10-r57.test.mjs`, `seam-t51.test.mjs`). The team holds one body, and she reaches the fold by asking about it: with a name known
   the fold is not drawn until the record answers that it holds no office there (R20, R39). */
import { press, ok } from "./page.mjs";

export const BODY = "ENT-2026-0000000000000001";
export const BODY_NAME = "City of Port Ellery";
/** The days she states for the body: the owner places the office on any day between them (`lines` R10). */
export const DAYS = { "req-noff-since": "2000-01-01", "req-noff-until": "2099-12-31" };

/** `base` with the team's body known and the offices named so far answered as the record would: the body holds none until one is named; an office
 *  named is a post in the body, so asked about it answers it as named (`actions` R111). Naming the same name again answers the first (`existed`,
 *  `entities` R65). `fixed` is the id the first naming answers, else a counter's. */
export function naming(base, { fixed = null } = {}) {
  const held = new Map(), byId = new Map();
  let n = 0;
  return {
    ...base,
    peopledirectory: ok({ rows: [{ entity: BODY, kind: "body", name: BODY_NAME }], truncated: false }),
    entitycreate: (req) => {
      const body = req.body && req.body.json ? req.body.json : req.body || {};
      const key = String(body.label).toLowerCase();
      if (held.has(key)) return ok({ ...held.get(key), existed: true });
      const row = { entity_id: fixed || `ENT-2026-${String(++n + 1).padStart(16, "0")}`, label: body.label, kind: "office" };
      held.set(key, row);
      byId.set(row.entity_id, row);
      return ok(row);
    },
    linesof: ok({ ok: true, lines: [] }),
    recordline: ok({ ok: true }),
    addresseesuggest: (req) => {
      const q = (req.query && req.query.subject) || new URL(req.url, "http://x").searchParams.get("subject");
      const o = byId.get(q);
      return ok(o ? { ok: true, subject: q, offices: [{ addressee: { state: "named", kind: "office", role: o.label, body: BODY_NAME, entity_id: o.entity_id } }], undetermined: [] }
        : { ok: true, subject: q, offices: [], undetermined: [] });
    },
  };
}

/** She asks about the body: the record holds no office in it, and the fold that names one is drawn. */
export async function reach(p, until) {
  await press(p, "addresseesuggest", { values: { "req-subject": BODY } });
  await until(p, () => p.doc.getElementById("req-noff-name"), "the fold that names an office");
}
