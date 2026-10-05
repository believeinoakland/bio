/* The existing fixtures every type was tested on in docprofile, each read under every view
 * that decides something (R18): the real documents (FW-18, FW-20) under the held profiles'
 * view, and the made-up Port Alder and Lakemont documents under their own, each other's and
 * the empty view. `now` is fixed, so the calendar's forward-looking reading is repeatable. */
import fs from "node:fs";
import { PORT_ALDER, LAKEMONT, view, EMPTY, HELD, PA_AGENDA, PA_MINUTES, PA_REPORT, PA_BYLAW, PA_DIRECTORY,
         calendarHtml } from "./fixtures.mjs";

const json = (f) => JSON.parse(fs.readFileSync(new URL(`./fixtures/${f}`, import.meta.url), "utf8"));
const FW18 = json("fw18-doctypes.json").documents;
const FW20 = json("fw20-staff-directory.json").documents;
const NOW = "2026-03-20T12:00:00Z";
const VIEWS = { held: HELD, pa: view(PORT_ALDER), lk: view(LAKEMONT), empty: EMPTY };

export const CASES = [];
for (const [k, d] of Object.entries(FW18)) CASES.push({ id: `fw18:${k}@held`, view: "held", supplied: d.text, ctx: { view: HELD, now: NOW } });
for (const [k, d] of Object.entries(FW20)) CASES.push({ id: `fw20:${k}@held`, view: "held", supplied: d.text, ctx: { view: HELD, now: NOW } });
const MADE = { agenda: PA_AGENDA, minutes: PA_MINUTES, report: PA_REPORT, bylaw: PA_BYLAW, directory: PA_DIRECTORY,
  calendar: calendarHtml([["1", "Harbor Commission", "3/2/2026", null, "11"], ["2", "Select Board", "3/4/2026", null, "21", "22"],
                          ["3", "Harbor Commission", "4/2/2026"]]),
  calendar_cancelled: calendarHtml([["1", "Harbor Commission", "3/2/2026", "CANCELLED", "11"], ["2", "Select Board", "3/4/2026", null, "21", "22"]]) };
for (const [v, vw] of Object.entries(VIEWS)) {
  if (v === "held") continue;
  for (const [k, t] of Object.entries(MADE))
    CASES.push({ id: `pa:${k}@${v}`, view: v, supplied: t, ctx: { view: vw, now: NOW, locator: "https://r.test/Calendar.aspx" } });
}

/** Every ordered pair of readings of one type under one view, each with itself too. */
export function pairsOf(readings) {
  const byCase = new Map(CASES.map((c) => [c.id, c]));
  const out = [];
  for (const a of CASES) for (const b of CASES) {
    if (a.view !== b.view || readings[a.id].type !== readings[b.id].type) continue;
    if (!byCase.has(a.id) || !byCase.has(b.id)) continue;
    out.push([a.id, b.id]);
  }
  return out;
}
