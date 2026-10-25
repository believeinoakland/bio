/* R76 (T51): how the totality tests of R21 take the class of browser acts. `browserActs(registry)` returns the names of
   `BROWSER_ACTS` after checking the reading (b): each is exactly one `owed` row of the screen registry, whose text equals
   the table's `registry` string; the totality tests subtract them from the acts the registry still marks `owed`, and
   check that what is left is declared or named as before. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
/* browser.mjs reads `OPS` as it is evaluated, so the owners are registered first (R80); a sibling import would otherwise run
   while register-owners.mjs awaits the collector. */
import { REGISTERED } from "./register-owners.mjs";
import { BROWSER_ACTS, OPS } from "../../../src/op-declarations/index.mjs";

export const browserActs = (registry) => {
  const rows = registry.screens.flatMap((s) => s.acts.filter((a) => a.status === "owed").map((a) => ({ screen: s.id, op: a.op })));
  const names = Object.keys(BROWSER_ACTS).sort();
  for (const act of names) {
    const found = rows.filter((r) => r.op === BROWSER_ACTS[act].registry);
    assert.equal(found.length, 1, `${act}: not exactly one owed row for ${BROWSER_ACTS[act].registry}`);
    assert.equal(found[0].screen, BROWSER_ACTS[act].screen, `${act}: on another screen`);
  }
  return names;
};

/* The fix round of T51 (DEC-374 to DEC-385; K4165, K4168, K4169): the acts the screen registry marks `owed` whose ops their
   owners build and declare in this round (`DECLARED_OPS`, registered by the plane, R80). None is a hand row here, so each has
   no spec in `OPS` (R6) until then; the totality tests read them as still owed, class (c) of R21. Derived from the
   registry's own owed rows (K3268: no hand list): every owed act that is no op, no browser act (R76) and no installer
   route; an act leaves the list when it becomes an op. */
const INSTALLER = ["installalongside", "installremove", "installremoveconfirm", "installupdate"];
const owedActs = (file, dir = "./fixtures/") => {
  const rows = JSON.parse(readFileSync(new URL(`${dir}${file}`, import.meta.url), "utf8"));
  return [...new Set(rows.screens.flatMap((s) => s.acts).filter((a) => a.status === "owed")
    .map((a) => a.op.replace(/^owed:/, "").split(" ")[0]))];
};
/* Two registries are read: t34 to t51 take the one at `43379a1a44` (the fixture they were written against); R73 takes the
   design's, at `f72b2f8a4c` (DEC-419; G53), which owes the T52 acts too (K4403, DEC-406, DEC-409, DEC-415). */
const OWED_ALL = owedActs("registry-43379a1a44.json");
const DECLARED_BY_OWNERS = new Set(Object.values(REGISTERED).flatMap((rows) => Object.keys(rows)));
/** The owed acts an owner declares (class (a) of R21, R80): each is read as served by its declaration, so it is an op. */
export const OWED_SERVED_BY_OWNERS = OWED_ALL.filter((act) => DECLARED_BY_OWNERS.has(act) && !Object.hasOwn(BROWSER_ACTS, act)).sort();
const notBuilt = (acts) => acts
  .filter((act) => !Object.hasOwn(OPS, act) && !Object.hasOwn(BROWSER_ACTS, act) && !INSTALLER.includes(act)).sort();
/** The owed acts of the registry at `43379a1a44` that no op, browser act or installer route is (what t34 to t51 read). */
export const OWED_BY_FIX_ROUND_AT_43379A1A44 = notBuilt(OWED_ALL);
/** The same for the design's registry wizard-scripts R41 carries (its `source/registry.json`, re-taken at `c752a602da`,
 *  K5069; read from there, never copied): the acts the fix rounds and T52 still owe (R73). */
export const OWED_BY_FIX_ROUND = notBuilt(owedActs("registry.json", "../wizard-scripts/source/"));
