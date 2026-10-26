/* Section A: the front door and the site pages, a stranger with no session (R01), before the claim. */
import http from "node:http";
import { writeFileSync, mkdirSync } from "node:fs";
import site from "../../../../site/src/index.mjs";
import { rec, shot, metrics, pageAt, ST, stSummary, SHOTS } from "./lib.mjs";

const TXT = "/tmp/claude-0/-home-user-bio/c2cf8ee5-f1d6-55a5-8567-3b50777e844e/scratchpad/txt";
mkdirSync(TXT, { recursive: true });
export const dump = (name, t) => writeFileSync(`${TXT}/${name}.txt`, t);
const body = (p) => p.innerText("body");

export async function secA(ctx) {
  const { kit, browser, base } = ctx;
  /* ---- the team's own front door, unclaimed room, as a stranger ---- */
  for (const w of [1280, 390]) {
    const p = await pageAt(browser, base, { width: w });
    const t0 = Date.now();
    const r = await p.goto(base + "/", { waitUntil: "networkidle" });
    const wall = Date.now() - t0;
    await p.waitForTimeout(800);
    const text = await body(p), m = await metrics(p), title = await p.title();
    dump(`A-front-${w}`, `${title}\n${JSON.stringify(m)}\n${text}`);
    const f = await shot(p, `A-front-${w}`);
    rec("R01", "the team's front door in an unclaimed room (stranger)", w, "stranger", "opened / with no session", "WORKS", `title "${title}"; ${m.text} chars; scrollW ${m.scrollW}/${m.w}; wall ${wall} ms; outside requests ${p.outside.length}; page errors ${p.errs.length}; Server-Timing ${ST(r).slice(0, 80)}`, f);
    await p.context().close();
  }
}
