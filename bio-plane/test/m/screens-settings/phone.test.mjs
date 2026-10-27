/* C81 (T51 fix round 3; DEC-376; amends R15, R19, R3): the settings screens' own controls at the phone's width, measured in Chromium over the
   real served page: nothing passes the screen's edge and every control (a button, a link, a field, a ticked box with its words) is at
   least 44 px each way, on Security, Account and Places; the desktop width draws the same screens without a cut control. Needs
   `playwright-core` and Chromium (see measure.mjs). The page is drawn over the world (store-request): its door answers the browser's requests. */
import test from "node:test";
import assert from "node:assert/strict";
import { measure, FIT } from "./measure.mjs";
import { securityTeam, teamNamed } from "./seed-common.mjs";

const HOUR = 3600000;
/** The browser's request, answered by the world's door for the member who is signed in (the page holds her session). */
const doorOf = (w, as) => ({ door: ({ query, body }) => w.door({ url: "/api/?" + new URLSearchParams(query),
  init: body === undefined ? { method: "GET" } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }, as), session: as.session });

/* the scanner's mirror was refused a day ago: the security screen says since when and why */
const security = async () => { const t = await securityTeam({ state: (now) => ({ last_attempt: new Date(now - 20 * HOUR).toISOString(), last_error: "REFUSED:main.cvd:403" }) }); return doorOf(t.w, t.founder); };
const account = async () => { const t = await teamNamed("full"); return doorOf(t.w, t.dev); };
const places = async () => { const t = await teamNamed("full"); return doorOf(t.w, t.founder); };

const SCREENS_AT = [
  ["Security (the scanner's state, its button, the tools and the checkers)", "/app/security", security],
  ["Account (the key to make or load, the language, the pairing, the links)", "/app/account", account],
  ["Places (the places chosen, a named office and its confirm, the courts, the rules)", "/app/places", places],
];

for (const [name, path, world] of SCREENS_AT) {
  test(`C81 ${name}: at 390 px nothing is cut and every control is at least 44 px each way; at 1280 px nothing is cut (control)`, async () => {
    const door = await world();
    const at = (width) => measure({ path, width, ...door, ready: "#cs-main h1", measure: FIT });
    const phone = await at(390);
    assert.ok(phone.mainScroll <= 390, `the page is no wider than the screen: ${phone.mainScroll}`);
    assert.deepEqual(phone.over, [], "nothing passes the screen's edge");
    assert.deepEqual(phone.small, [], "every control is at least 44 px each way");
    const wide = await at(1280);
    assert.ok(wide.mainScroll <= 1280, "the desktop layout fits");
    assert.deepEqual(wide.over, [], "nothing passes the edge at 1280 px either");
  });
}
