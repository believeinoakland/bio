/* FW-18's control PROBE. Not a suite — it prints ONE machine-readable line per fixture
 * so `nc-fw18.mjs` can check a declared MUST-FAIL and a declared MUST-STAY separately.
 *
 * WHY A PROBE AND NOT JUST THE SUITE. The suite exits on its first failing assertion,
 * so "the suite went red" cannot tell an arm that broke the ONE thing it aimed at from
 * an arm that broke everything. A control whose only signal is red/green would score
 * `every type stopped detecting` as a success on an arm that neutered one detector.
 * `node civicos-ui/test/nc-fw18.probe.mjs [--string]` from the repo root.
 *
 * `--string` re-reads every fixture with its text passed as a BARE STRING instead of
 * I2's itemised `text` shape, which is the over-strictness arm: correct work in a
 * spelling the reader did not anticipate must still be recognised, and the only thing
 * that may change is that nothing can say WHERE.
 */
import fs from "fs";
import { readText } from "../../docprofile/readtext.mjs";

const asString = process.argv.includes("--string");
const FX = JSON.parse(fs.readFileSync(new URL("./fixtures/fw18-doctypes.json", import.meta.url), "utf8"));
for (const [k, d] of Object.entries(FX.documents)) {
  let line;
  try {
    const r = readText(asString ? d.text.document : d.text, {});
    if (!r.determined) line = `${k} type=NOREADING conf=- also=- ents=- pos=- parts=-`;
    else {
      const ents = (r.parsed && r.parsed.entities) || [];
      line = `${k} type=${r.doctype.type.key} conf=${r.doctype.confidence} `
        /* The `also` list carries its CONFIDENCES, because FW-18's `ratefence` arm bites
           there and not on the primary verdict — see that arm's note in nc-fw18.mjs. */
        + `also=${((r.doctype.also || []).map((x) => `${x.key}:${x.confidence}`).sort().join("+")) || "-"} `
        + `ents=${ents.length} pos=${ents.filter((e) => e.source).length} parts=${r.position_parts}`;
    }
  } catch (e) {
    /* A TypeError inside a probe goes through no assertion at all, so it is REPORTED
       rather than allowed to end the module with a clean-looking tally. */
    line = `${k} type=THREW conf=- also=- ents=-1 pos=-1 parts=-1 err=${String((e && e.message) || e).slice(0, 80)}`;
  }
  console.log(line);
}
