/* screens-action's tests of an office a member names from Request (R20, R57), over the REAL `entities`, `lines`, `actions` and `filings` (real.mjs), never a
   scripted double of one: the team holds one body, and she reaches the fold by asking about it, because with a name known the fold is drawn only once the
   record answers that it holds no office there (R20, R39). `base` is the plane's other answers (the profile, the shell's reads). */
import { press, ok } from "./page.mjs";
import { realWorld, realPlane, V } from "./real.mjs";

export const BODY_NAME = "City of Port Ellery";
/** The days she states for the body: the owner places the office on any day between them (`lines` R10). */
export const DAYS = { "req-noff-since": "2000-01-01", "req-noff-until": "2099-12-31" };

/** `{x, plane, body}`: the real world with no office held and one body (registered as an administrator registers one), `plane` answering the real
 *  providers' ops and the team's names (the body) as `base` otherwise. */
export function naming(base) {
  const x = realWorld();
  x.w.st.sql.exec(`DELETE FROM entities WHERE kind = 'office'`);
  const body = x.ents.createEntity({ kind: "body", label: BODY_NAME, note: "the agency the office is in", declaredBy: V("olive") }).entity_id;
  const list = ok({ bundles: [{ bundle_id: x.proj, object_type: "project", title: "Parks" }], limit: 500, cursor: null, total: 1 });
  const plane = realPlane(x, V("olive"), { list, ...base, peopledirectory: ok({ rows: [{ entity: body, kind: "body", name: BODY_NAME }], truncated: false }) });
  return { x, plane, body, path: `/app/request/${x.proj}` };
}

/** She asks about the body: the record holds no office in it, and the fold that names one is drawn. */
export async function reach(p, body, until) {
  await press(p, "addresseesuggest", { values: { "req-subject": body } });
  await until(p, () => p.doc.getElementById("req-noff-name"), "the fold that names an office");
}
