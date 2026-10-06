/* How the captured fixtures beside this file were taken (legistar-reader R16; legistar-events §7).
 *
 * Run by hand, never by the tests: `node legistar-reader/test/fixtures/capture.mjs <out-dir>`. Every read
 * is a keyless GET of the Legistar Web API. Before anything is written, every field whose name names an
 * e-mail, phone, fax, street address or web address of a person or body is dropped (K1485; the reader
 * drops them again, R3), so no contact value is ever held in the repository. Each file is
 * `{locator, captured_at, body}`, `body` the response as parsed JSON with those fields removed. */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const API = "https://webapi.legistar.com/v1/oakland";
const CONTACT = /e-?mail|phone|fax|address|city\d|state\d|zip|www/i;

/* The 50 gold events of legistar-events §5, in its order. */
export const GOLD = [9016, 9077, 9098, 9087, 9095, 9117, 9121, 9119, 9145, 9148, 9161, 9168, 9205, 9210, 9197,
  9206, 9215, 9217, 9235, 9240, 9229, 9228, 9269, 9285, 9309, 9315, 9338, 9378, 9381, 9388, 9391, 9393, 9402,
  9418, 9422, 9428, 9441, 9450, 9451, 9457, 9469, 9465, 9473, 9492, 9506, 9498, 9518, 9520, 9559, 9580];

export function strip(v) {
  if (Array.isArray(v)) return v.map(strip);
  if (!v || typeof v !== "object") return v;
  const out = {};
  for (const [k, x] of Object.entries(v)) if (!CONTACT.test(k)) out[k] = strip(x);
  return out;
}

async function take(out, name, locator) {
  const r = await fetch(locator, { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error(`${locator}: HTTP ${r.status}`);
  const body = strip(await r.json());
  writeFileSync(join(out, name + ".json"),
    JSON.stringify({ locator, captured_at: new Date().toISOString(), body }) + "\n");
  return body;
}

const q = (s) => s.replace(/ /g, "%20");

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = process.argv[2];
  if (!out) throw new Error("usage: capture.mjs <out-dir>");
  mkdirSync(join(out, "gold"), { recursive: true });
  await take(out, "bodies", `${API}/bodies`);
  await take(out, "persons", `${API}/persons`);
  await take(out, "officerecords-0", `${API}/officerecords?$top=1000&$skip=0`);
  await take(out, "officerecords-1", `${API}/officerecords?$top=1000&$skip=1000`);
  await take(out, "events-3y", q(`${API}/events?$filter=EventDate ge datetime'2023-10-01' and EventDate lt datetime'2026-10-06'`));
  for (const id of GOLD) await take(join(out, "gold"), String(id), `${API}/events/${id}`);
  const items = await take(out, "eventitems-9451", `${API}/events/9451/eventitems?AgendaNote=1&MinutesNote=1&Attachments=0`);
  const voted = items.filter((i) => i.EventItemRollCallFlag === 1 || i.EventItemPassedFlag !== null).slice(0, 3);
  for (const i of voted) await take(out, `votes-${i.EventItemId}`, `${API}/eventitems/${i.EventItemId}/votes`);
  await take(out, "matters-2025-06", q(`${API}/matters?$filter=MatterIntroDate ge datetime'2025-06-01' and MatterIntroDate lt datetime'2025-07-01'`));
}
