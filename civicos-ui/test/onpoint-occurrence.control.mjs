/* UI-112 — the negative control for `onpoint-occurrence.test.mjs`.
 *
 * Each arm is armed ALONE on the EXTRACTED app script (`app.html` is never edited, so there is nothing
 * to restore), each splice asserted to match EXACTLY ONCE, and each arm DECLARES before it runs which
 * assertions MUST fail — by their names — and that every other must stay green. An arm whose failures
 * differ from its declaration in either direction is reported NOT AS DECLARED.
 *
 *   nooccurrence  THE ROW'S CONTROL: the act sent without `occurrence=` — the three-page arm reads C-74.4.
 *   strings       the pre-UI-112 offer: the places read are ignored, so the string is offered, not its places.
 *   preselect     every offer marked as the current choice.
 *   spelling      THE OVER-STRICTNESS ARM: the same facts in different page wording — must PASS.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";

const SUITE = new URL("./onpoint-occurrence.test.mjs", import.meta.url).pathname;
const BASE = appScript();

const SEND = '  if(d.onpointOccurrence) body.occurrence = d.onpointOccurrence;\n';
const PLACES = '    const places = (occ && occ.get(ref)) || null;\n';
const CURRENT = '(mine && !mine.lapsed && at(o, mine.ref, mine.position) ? " — the current choice" : "")';
const WHERE = '(o.place && o.place.ref ? ` — read at ${esc(o.place.ref)}` : ` — where it was read is not recorded`)';

const ACCEPTED = (p) => `THREE-PAGE ARM: the offer at ${p} is ACCEPTED — the act carried occurrence=${p} and the plane recorded that place`;
const ARMS = {
  baseline: { arm: (s) => s, fails: [] },
  nooccurrence: { arm: (s) => one(s, SEND, ''),
    fails: [ACCEPTED("p.3"), ACCEPTED("p.7"), ACCEPTED("p.11"),
            "THREE-PAGE ARM: no offer reads C-74.4 CONNECTION_CHOICE_OCCURRENCE_UNNAMED (or any refusal)",
            "...three distinct occurrence keys were recorded, one per place",
            "the page rendered the PLANE's own `says` for the last act, verbatim",
            "the plane's read carries the member's on_point with the LAST place's key, and the machine's pair unchanged",
            "...and an offer taken from the plane's list is ACCEPTED",
            "the corpus these arms read is non-empty (a totality over nothing is not evidence)"] },
  strings: { arm: (s) => one(s, PLACES, '    const places = null;\n'),
    /* with one string, the old offer draws NO control (it needed two strings), so every arm resting on §1's offers
       falls with it; §3's act and refusal do not rest on the offer and stay green. */
    fails: ["THREE-PAGE ARM: a string read on three pages OFFERS THREE CHOICES, one per place",
            "the machine's pair is marked at ITS place only, not at every place of the string",
            "THREE-PAGE ARM: no offer reads C-74.4 CONNECTION_CHOICE_OCCURRENCE_UNNAMED (or any refusal)",
            "...three distinct occurrence keys were recorded, one per place",
            "the page rendered the PLANE's own `says` for the last act, verbatim",
            "the plane's read carries the member's on_point with the LAST place's key, and the machine's pair unchanged",
            "...and the three places are still offered, so choosing again can settle it",
            "the corpus these arms read is non-empty (a totality over nothing is not evidence)"] },
  preselect: { arm: (s) => one(s, CURRENT, '" — the current choice"'),
    fails: ["NOTHING PRESELECTED: no offer is marked the current choice while the plane publishes no on_point",
            "...and is NOT rendered as a standing choice, nor marked current at any place"] },
  spelling: { arm: (s) => one(s, WHERE, '(o.place && o.place.ref ? ` (page ${esc(o.place.ref)})` : ` (place unrecorded)`)'),
    fails: [] },
};
function one(s, from, to){
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 90)}`);
  return s.replace(from, to);
}

const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui112-onpoint-ctl-"));
const results = [];
try {
  for (const [name, { arm, fails: declared }] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, UI112_APP_SRC: file },
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }); }
    catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); code = e.status ?? -1; }
    const tally = (/onpoint-occurrence: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
    const failed = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((m) => m[1].trim());
    const asDeclared = tally[0] >= 0 && failed.length === declared.length && declared.every((d) => failed.includes(d));
    results.push({ name, code, tally, failed, asDeclared });
    console.log(`\n[${name}] exit ${code} · ${tally[0]} pass / ${tally[1]} fail · ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
    for (const f of failed) console.log(`    FAIL ${f.slice(0, 160)}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
const bad = results.filter((r) => !r.asDeclared);
console.log(`\ncontrol: ${results.length} arm(s) run; ${bad.length
  ? "NOT AS DECLARED: " + bad.map((r) => r.name).join(", ")
  : "every arm as declared"}`);
process.exit(bad.length ? 1 : 0);
