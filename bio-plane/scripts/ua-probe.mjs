#!/usr/bin/env node
/* D-94: the mechanical user-agent probe.
 *
 * We are admitted at www.oaklandca.gov because Akamai does not recognise
 * CivicOS. When the string enters its bot directory it will be categorised and
 * refused exactly as archive.org_bot already is, and at that moment the
 * question is WHICH COMPONENT of the agent the categoriser keyed on. Guessing
 * produced two wrong theories over three sessions; this varies the components
 * systematically, one ladder from the full honest string down to a bare token,
 * runs each variant several times with human pacing, and records every
 * combination with its result as a measurement.
 *
 * It never impersonates a browser. The ladder descends from legibility toward
 * bareness; it does not ascend toward disguise, because BIO does not disguise
 * its requests and a probe that tried Mozilla strings would be measuring a
 * door this project has ruled it will not walk through.
 *
 * Output is a MEASUREMENTS.md-shaped section on stdout and a JSON file beside
 * it, so the run is filed rather than remembered.
 *
 * usage: node ua-probe.mjs --url <refusing URL> [--repeats 3] [--version 0.46.0]
 *          [--instance biosmoke7] [--confirm-url <second unrelated path>]
 *          [--out ua-probe-<date>.json]
 */
import { writeFileSync } from "node:fs";

const argv = process.argv.slice(2);
const flag = (name, dflt = null) => { const i = argv.indexOf(name); return i === -1 ? dflt : (argv[i + 1] ?? dflt); };
const URL_ = flag("--url");
const REPEATS = Number(flag("--repeats", "3"));
const VERSION = flag("--version", "0.0.0");
const INSTANCE = flag("--instance", "biosmoke7");
const CONFIRM = flag("--confirm-url", null);
const OUT = flag("--out", `ua-probe-${new Date().toISOString().slice(0, 10)}.json`);
if (!URL_) { console.error("usage: node ua-probe.mjs --url <refusing URL> [--repeats N] [--version V] [--instance N] [--confirm-url U]"); process.exit(2); }

const CONTACT = "https://github.com/believeinoakland/bio";

/* The ladder. Each rung removes ONE component from the rung above, so a
 * transition in the results names the component that mattered. The bottom
 * rungs are the historically refused strings, kept as negative controls: a
 * run in which nothing is refused is a run that learned nothing about the
 * refusal, and says so. */
const LADDER = [
  ["full",             `CivicOS/${VERSION} (+${CONTACT}; instance ${INSTANCE}; acquire)`],
  ["no purpose",       `CivicOS/${VERSION} (+${CONTACT}; instance ${INSTANCE})`],
  ["no instance",      `CivicOS/${VERSION} (+${CONTACT}; acquire)`],
  ["no contact",       `CivicOS/${VERSION} (instance ${INSTANCE}; acquire)`],
  ["bare comment",     `CivicOS/${VERSION} (acquire)`],
  ["product+version",  `CivicOS/${VERSION}`],
  ["product only",     `CivicOS`],
  ["historic token",   `bio-acquire`],
  ["no header",        null],
];

const sleep = (ms) => new Promise((s) => setTimeout(s, ms));
const pace = () => 2000 + Math.floor(Math.random() * 3000);

async function probe(url, ua) {
  try {
    const r = await fetch(url, { redirect: "follow",
      headers: ua === null ? {} : { "user-agent": ua } });
    /* Drain without keeping: the status is the measurement. */
    await r.arrayBuffer();
    return r.status;
  } catch (e) { return `ERR:${String(e && e.message || e).slice(0, 40)}`; }
}

const startedAt = new Date().toISOString();
console.error(`ua-probe against ${URL_}, ${REPEATS} repeats per rung, human-paced`);
const results = [];
for (const [label, ua] of LADDER) {
  const statuses = [];
  for (let i = 0; i < REPEATS; i++) {
    statuses.push(await probe(URL_, ua));
    await sleep(pace());
  }
  const uniform = statuses.every((s) => s === statuses[0]);
  results.push({ label, ua, statuses, uniform });
  console.error(`  ${label.padEnd(16)} ${statuses.join(" ")}${uniform ? "" : "  <- NON-UNIFORM, repeat before believing"}`);
}

/* The verdict follows the agent only if it follows the agent on a second,
 * unrelated path too; one URL confounds the agent with the path. */
let confirm = null;
if (CONFIRM) {
  console.error(`confirming boundary rungs on ${CONFIRM}`);
  confirm = [];
  for (const r of results) {
    const prevIdx = results.indexOf(r) - 1;
    const boundary = prevIdx >= 0 &&
      JSON.stringify(results[prevIdx].statuses[0]) !== JSON.stringify(r.statuses[0]);
    if (!boundary && r !== results[0] && r !== results[results.length - 1]) continue;
    const statuses = [];
    for (let i = 0; i < Math.min(REPEATS, 2); i++) { statuses.push(await probe(CONFIRM, r.ua)); await sleep(pace()); }
    confirm.push({ label: r.label, statuses });
    console.error(`  ${r.label.padEnd(16)} ${statuses.join(" ")}`);
  }
}

const record = { instrument: "scripts/ua-probe.mjs", url: URL_, confirm_url: CONFIRM,
  repeats: REPEATS, started_at: startedAt, finished_at: new Date().toISOString(),
  egress: "unstated: record where this ran, since unreachable is a property of a host AND an egress",
  results, confirm };
writeFileSync(OUT, JSON.stringify(record, null, 1));
console.error(`filed: ${OUT}`);

/* The appendable section. */
const rows = results.map((r) =>
  `| ${r.label} | \`${r.ua === null ? "(no user-agent header)" : r.ua}\` | ${r.statuses.join(", ")} |`).join("\n");
console.log(`
## User-agent component probe at ${new URL(URL_).host}

Measured **${startedAt.slice(0, 10)}**. Instrument: \`scripts/ua-probe.mjs\`
against \`${new URL(URL_).pathname}\`, ${REPEATS} requests per rung, human-paced,
agent varied alone, one component removed per rung so a transition names the
component that mattered.

| Rung | User-agent | Results |
| --- | --- | --- |
${rows}
${confirm ? `\nBoundary rungs re-confirmed on \`${new URL(CONFIRM).pathname}\`: ${confirm.map((c) => `${c.label} ${c.statuses.join("/")}`).join("; ")}.` : ""}
`);
