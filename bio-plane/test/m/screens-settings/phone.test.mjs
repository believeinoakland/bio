/* C81 (T51 fix round 3; DEC-376; amends R15, R19, R3): the settings screens' own controls at the phone's width, measured in Chromium over the
   real served page: nothing passes the screen's edge and every control (a button, a link, a field, a ticked box with its words) is at
   least 44 px each way, on Security, Account and Places; the desktop width draws the same screens without a cut control. Needs
   `playwright-core` and Chromium (see measure.mjs). */
import test from "node:test";
import assert from "node:assert/strict";
import { measure, FIT, planeOf } from "./measure.mjs";
import { ADMIN, MEMBER, env, securityTable, accountTable, placesTable } from "./fixtures.mjs";

const NS = { since: "2026-10-15T03:00:00Z", reason: "REFUSED:main.cvd:403", key: "file-safety.index.no_signatures_since", words: "w", reason_key: "file-safety.index.signatures_refused", reason_words: "r" };
const security = () => securityTable({ scanstatus: env({ ok: true, scanner: { bound: true, version: "1" }, renderer: { bound: true, version: "1" }, signatures_age_ms: null, queued: 48, overdue: 0, held: 0, tools: [], no_signatures: NS }) });
const NAMED = { entity_id: "ENT-0201", kind: "office", label: "Records Office of the Agency", note: "n", declared_by: "member:lu", at: "2026-10-12T00:00:00Z", named_by_member: true, contact: { kind: "portal", value: "https://records.agency.example/portal" }, law: "FOIA, 5 U.S.C. 552" };
const places = () => placesTable({ entitieskind: (q) => (q.kind === "body" ? env({ ok: true, kind: "body", entities: [], count: 0, limit: 500, truncated: false, next: null }) : env({ ok: true, kind: "office", entities: [NAMED], count: 1, limit: 500, truncated: false, next: null })) });

const SCREENS_AT = [
  ["Security (the scanner's state, its button, the tools and the checkers)", "/app/security", security, ADMIN],
  ["Account (the key to make or load, the language, the pairing, the links)", "/app/account", () => accountTable(MEMBER), MEMBER],
  ["Places (the places chosen, a named office and its confirm, the courts, the rules)", "/app/places", places, ADMIN],
];

for (const [name, path, table, me] of SCREENS_AT) {
  test(`C81 ${name}: at 390 px nothing is cut and every control is at least 44 px each way; at 1280 px nothing is cut (control)`, async () => {
    const at = (width) => measure({ path, width, plane: planeOf(table(), me), ready: "#cs-main h1", measure: FIT });
    const phone = await at(390);
    assert.ok(phone.mainScroll <= 390, `the page is no wider than the screen: ${phone.mainScroll}`);
    assert.deepEqual(phone.over, [], "nothing passes the screen's edge");
    assert.deepEqual(phone.small, [], "every control is at least 44 px each way");
    const wide = await at(1280);
    assert.ok(wide.mainScroll <= 1280, "the desktop layout fits");
    assert.deepEqual(wide.over, [], "nothing passes the edge at 1280 px either");
  });
}
