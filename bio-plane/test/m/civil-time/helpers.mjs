/* civil-time's tests: the jurisdiction views every service is tested against (R27): the first profile and the test
 * profile, through `jurisdictions.combine`, on the profiles' own facts (T33-2 merged; K1526). The one fact added here
 * is a historical closure-list year the first profile does not hold and a worked example counts through (R1 reaches
 * 2024): fixture data for that example, with its citation (K1523). A year the profile holds is never replaced. */
import { combine } from "../../../../jurisdictions/index.mjs";

const h = (date, name) => ({ date, name });
const yearList = (list, year, days, citation, basis) => ({ year, list, days, citation, status: "researched", basis });

/* CCP § 135 judicial holidays, 2024, as the Superior Court's calendar lists them. */
const HISTORICAL = [
  yearList("judicial", 2024, [h("2024-01-01", "New Year's Day"), h("2024-01-15", "Martin Luther King Jr. Day"), h("2024-02-12", "Lincoln Day"),
    h("2024-02-19", "Washington Day"), h("2024-04-01", "Cesar Chavez Day (observed)"), h("2024-05-27", "Memorial Day"),
    h("2024-06-19", "Juneteenth"), h("2024-07-04", "Independence Day"), h("2024-09-02", "Labor Day"), h("2024-09-09", "Admission Day"),
    h("2024-09-27", "Native American Day"), h("2024-11-11", "Veterans Day"), h("2024-11-28", "Thanksgiving Day"),
    h("2024-11-29", "Day after Thanksgiving"), h("2024-12-25", "Christmas Day")], "Code Civ. Proc. § 135 (2024)", "2026-10-05"),
];

function viewOf(id, extra = []) {
  const r = combine([id]);
  if (!r.ok) throw new Error(`combine([${id}]) failed: ${JSON.stringify(r.errors)}`);
  const v = r.view;
  for (const x of extra) if (!v.holidays.some((y) => y.list === x.list && y.year === x.year)) v.holidays.push(x);
  return v;
}

/** The first profile's view and the test profile's, each a fresh copy. */
export const firstView = () => viewOf("oakland-alameda", HISTORICAL);
export const testView = () => viewOf("test-port-ellery");
export const ruleOf = (view, name) => {
  const r = view.deadlines.find((d) => d.rule === name);
  if (!r) throw new Error(`no rule ${name} in ${view.id}`);
  return r;
};
export const day = (value, zone) => ({ value, precision: "day", zone });
export const minute = (value, zone) => ({ value, precision: "minute", zone });
