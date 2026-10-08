/* op-declarations R6, R15, R19–R29 (T34-58, T34-83, T34-90–T34-92; K1565, K1749, K1755, K1784, K1785, K1793, K1807,
   K1818, K1837): T34's ops — the registry's requirement functions under their own names (R21), membership's group
   settings (R22), tasks' check requests (R23), the group's API key (R24), publishing at a set time (R25), the unheld
   place (R26), the library's owed acts (R27), the member's language and the first steps (R28), the two labelled drafts
   (R29) and `baseupdates` (R15). Each is checked whole against its requirement, at the exported tables, with negative
   controls. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as O from "../../../src/op-declarations/index.mjs";
import { AI_GRANT_OPS } from "../../../src/credentials/index.mjs";
import { credentialsOps } from "../../../src/credentials/index.mjs";
import { membershipOps } from "../../../src/membership/index.mjs";
import { publicationOps } from "../../../src/publication/index.mjs";
import { ratificationOps } from "../../../src/ratification/index.mjs";
import { eventsOps } from "../../../src/events/index.mjs";
import { linesOps } from "../../../src/lines/index.mjs";
import { moneyOps } from "../../../src/money/index.mjs";
import { dutiesOps } from "../../../src/duties/index.mjs";
import { peopleOps } from "../../../src/people/index.mjs";
import { workbooksOps } from "../../../src/workbooks/ops.mjs";
import { answersOps } from "../../../src/answers/ops.mjs";
import { hypothesesOps } from "../../../src/hypotheses/index.mjs";

const { OPS, SESSION_OPS, NEEDS, OP_STAMPS, OP_ALIASES, OP_FAMILIES, GOVERNANCE_ACTIONS, IDENTITY_ACTIONS,
        UNATTENDED_BY_DECISION, ACT_GATE } = O;
const MP = ["admin", "member", "probe"];
const plain = (s) => JSON.parse(JSON.stringify(s));
const both = (op) => SESSION_OPS.member.has(op) && SESSION_OPS.admin.has(op);
const neither = (op) => !SESSION_OPS.member.has(op) && !SESSION_OPS.admin.has(op);
const stamps = (op) => (Object.hasOwn(OP_STAMPS, op) ? [...OP_STAMPS[op]].sort() : null);
/* every exported list of op names (the act lists, the family-derived lists, the scope's two) */
const LISTS = Object.entries(O).filter(([, v]) => Array.isArray(v))
  .concat([["PLAN_RUN_SCOPE.reads", O.PLAN_RUN_SCOPE.reads], ["PLAN_RUN_SCOPE.writes", O.PLAN_RUN_SCOPE.writes]]);
const listsOf = (op) => LISTS.filter(([, l]) => l.includes(op)).map(([n]) => n).sort();
const unfenced = (op) => !GOVERNANCE_ACTIONS.includes(op) && !IDENTITY_ACTIONS.includes(op);
/* no table names an op that has no spec */
const inNoTable = (op) => !Object.hasOwn(OPS, op) && !Object.hasOwn(NEEDS, op) && neither(op) && !Object.hasOwn(OP_STAMPS, op)
  && listsOf(op).length === 0 && !Object.hasOwn(UNATTENDED_BY_DECISION, op);

/* An owner's map over a service that records each method it is called with and its arguments. */
const recorder = () => {
  const calls = [];
  const svc = new Proxy({}, { get: (_, k) => (k === "then" ? undefined : (...args) => { calls.push([k, args]); return { ok: true }; }) });
  return { svc, calls };
};
const drive = async (mapFn, op, { query = {}, body = {} } = {}) => {
  const url = new URL("http://plane/");
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const r = recorder();
  const map = mapFn(r.svc, url, body, r.svc, r.svc);
  try { await map[op](); } catch { /* recorded already */ }
  return r.calls;
};
const SENT = "member:sentinel-34";

const ROOT = new URL("../../../../", import.meta.url);
const registry = JSON.parse(readFileSync(new URL("docs/development/ux-substrate/screens/registry.json", ROOT), "utf8"));
const actsOf = (status) => [...new Set(registry.screens.flatMap((s) => s.acts).filter((a) => a.status === status).map((a) => a.op))];

/* R21: the five functions no op serves, each named back to BOB (op-declarations J1) */
const UNSERVED = ["countask", "deadlinecompute", "projectcreated", "registerproceeding", "setpassword"];

test("R21, R5: every act the screen registry marks `function` is an op under its lowercased name — already an op, or an alias in the one frozen table OP_ALIASES — but for the functions no op serves, which have no spec and are in no table (negative control: an unaliased name is seen)", () => {
  const fns = actsOf("function");
  assert.ok(fns.length >= 60, `${fns.length} functions`);
  for (const f of fns) {
    assert.equal(f, f.toLowerCase(), f);
    if (UNSERVED.includes(f)) assert.ok(inNoTable(f), `${f} is served by no op and must have no spec`);
    else assert.ok(Object.hasOwn(OPS, f), `${f}: no spec`);
  }
  for (const f of UNSERVED) assert.ok(fns.includes(f), `${f} is no registry function`);
  assert.ok(Object.isFrozen(OP_ALIASES));
  for (const [al, op] of Object.entries(OP_ALIASES)) {
    assert.ok(fns.includes(al), `${al} is no registry function`);
    assert.ok(Object.hasOwn(OPS, op) && !Object.hasOwn(OP_ALIASES, op), `${al} → ${op}`);
  }
  /* an alias exists only where the name was not already an op: the aliases are exactly the unserved-by-name functions */
  const named = fns.filter((f) => !UNSERVED.includes(f) && !Object.hasOwn(OP_ALIASES, f));
  assert.equal(Object.keys(OP_ALIASES).length + named.length + UNSERVED.length, fns.length);
  /* T35 (K1901): the person screen names `personexpunge` itself (DEC-142), so it is a declared op of people's family
     and no alias names `expunge`, which is no op */
  const onScreen = (op) => registry.screens.some((sc) => sc.acts.some((x) => x.op === op));
  assert.ok(onScreen("personexpunge") && !onScreen("expunge") && !fns.includes("expunge"));
  assert.ok(Object.hasOwn(OP_FAMILIES.people.kinds, "personexpunge") && !Object.hasOwn(OP_ALIASES, "personexpunge"));
  assert.ok(inNoTable("expunge") && !Object.values(OP_ALIASES).includes("personexpunge"));
  /* negative control */
  assert.ok(!Object.hasOwn(OPS, "createeventnow"));
});

test("R21, R2–R5: each alias equals its op in every table — the spec, both session sets, the NEEDS row (present or absent), every act list, the stamps and the unattended record — so the control plane gates, stamps and routes the two alike (negative control: a drifted alias is seen)", () => {
  for (const [al, op] of Object.entries(OP_ALIASES)) {
    assert.deepEqual(plain(OPS[al]), plain(OPS[op]), al);
    assert.ok(Object.isFrozen(OPS[al]), al);
    assert.equal(SESSION_OPS.member.has(al), SESSION_OPS.member.has(op), al);
    assert.equal(SESSION_OPS.admin.has(al), SESSION_OPS.admin.has(op), al);
    assert.equal(Object.hasOwn(NEEDS, al), Object.hasOwn(NEEDS, op), al);
    assert.equal(NEEDS[al], NEEDS[op], al);
    assert.equal(ACT_GATE.needs(al), ACT_GATE.needs(op), al);
    assert.equal(ACT_GATE.mode(al), ACT_GATE.mode(op), al);
    assert.deepEqual(listsOf(al), listsOf(op).filter((n) => !["FAMILY_OPS", "FAMILY_SESSION_OPS"].includes(n)
      && !/^OP_FAMILIES/.test(n)), al);
    assert.deepEqual(stamps(al), stamps(op), al);
    assert.equal(Object.hasOwn(UNATTENDED_BY_DECISION, al), Object.hasOwn(UNATTENDED_BY_DECISION, op), al);
    assert.ok(!O.FAMILY_OPS.includes(al), `${al} is no family's op`);
  }
  /* the aliases of the act lists' ops ride their lists: signerregister's, versionadopt's, strengthbar's, filingsent's */
  assert.ok(O.OWN_KEY_ACTIONS.includes("signerregisterown") && O.REEVALUATION_ACTIONS.includes("adoptversion"));
  assert.ok(O.DECLARATION_ACTIONS.includes("strengthbarset") && O.FILINGS_ACTIONS.includes("filingrecordsent"));
  assert.ok(O.QUERY_AUTHOR_ACTIONS.includes("filingrecordsent") && O.ACTION_LAYER_ACTIONS.includes("filingrecordsent"));
  /* negative control */
  assert.notDeepEqual(plain({ ...OPS.createevent, mutating: false }), plain(OPS.eventcreate));
});

test("R21: each alias names the function its op's arm calls — driven through the owner's own map, the method called is the alias's name, case aside (negative control: another op's arm calls another method)", async () => {
  const MAPS = { events: eventsOps, lines: linesOps, money: moneyOps, duties: dutiesOps, people: peopleOps,
                 workbooks: workbooksOps, answers: answersOps };
  let checked = 0;
  for (const [al, op] of Object.entries(OP_ALIASES)) {
    const owner = Object.values(OP_FAMILIES).find((f) => Object.hasOwn(f.kinds, op))?.owner;
    if (!MAPS[owner]) continue;
    const calls = await drive(MAPS[owner], op);
    assert.ok(calls.some(([k]) => String(k).toLowerCase() === al), `${owner}.${op} calls ${calls.map(([k]) => String(k))}, not ${al}`);
    checked++;
  }
  assert.ok(checked >= 22, `${checked} aliases driven`);
  /* the four outside the families are the act lists' (their owners' arms read in J1: credentials' signerRegisterOwn and
     signerRevokeOwn, reevaluation's adoptVersion and keepVersion, strength's strengthBarSet, filings' filingRecordSent) */
  assert.deepEqual(Object.keys(OP_ALIASES).length - checked, 6);
  /* negative control */
  const calls = await drive(eventsOps, "eventmerge");
  assert.ok(!calls.some(([k]) => String(k).toLowerCase() === "createevent"));
});

test("R21, R27 (K1901; T36, K2084): an act the registry marks `owed` is no op until its ruling's op is declared under its own name, and then it is that op, read as served with no alias made — on PR #13's registry the ten T34's and T35's ops declare and the nine R32 and R33 declare, `owed:placewanted` gone; no spec names `owed:`; the seven owed acts no owner serves have no spec", () => {
  for (const op of Object.keys(OPS)) assert.ok(!op.includes(":") && !op.includes(" "), op);
  const owed = actsOf("owed").map((a) => a.replace(/^owed:/, "").split(" ")[0]);
  /* the registry as PR #13 left it (T36): the owed acts whose ops this module declares under those names — T34's and
     T35's ten, and the nine R32 and R33 declare (DEC-168–DEC-173); the registry no longer marks `placewanted` */
  const DECLARED = ["archivelist", "findin", "groupdescriptiondraft", "memberlanguageset", "notedelete", "noterevise",
                    "publishat", "securitymap", "startfrom", "writinghelp",
                    "aikeepaway", "deepercheck", "openoriginal", "openwithwarning", "releasescanhold", "safeview",
                    "securitytooladd", "securitytooltest", "securitytoolremove"];
  assert.ok(!owed.includes("placewanted") && Object.hasOwn(OPS, "placewanted"));
  /* and the owed acts no owner serves in T36 (R27: subscriptionsignin, N708; the translation acts, N669; infolevelset) */
  const UNDECLARED = ["infolevelset", "subscriptionsignin", "translationadopt", "translationconfirm", "translationdraft",
                      "translationgrant", "translationrevert"];
  assert.deepEqual([...new Set(owed)].sort(), [...DECLARED, ...UNDECLARED].sort());
  for (const op of DECLARED) {
    assert.ok(Object.hasOwn(OPS, op), `${op} is owed and declared: no spec`);
    assert.ok(!Object.hasOwn(OP_ALIASES, op) && !Object.values(OP_ALIASES).includes(op), `${op} is aliased`);
  }
  for (const op of UNDECLARED) assert.ok(inNoTable(op), `${op} is owed and must have no spec`);
  /* negative control: an owed act given a spec would be seen as declared */
  assert.ok(!Object.hasOwn(OPS, "infolevelset"));
});

test("R22, R6: membership's T34 ops — the ten administrator's acts with hostingaccessset's spec (admin, member, probe; machineClasses admin, probe), mutating, by stamped from the query, a present null NEEDS row, in both session sets and in neither bearer fence; the two doors public, mutating, stamped nothing, in no session set and no NEEDS row; courtnotice a read of admin, member, probe stamped nothing; groupdescription a public read with viewer set; checkaddressees no spec (R6)", async () => {
  const ACTS = ["invitewithdraw", "websitekeycreate", "websitekeyset", "websitekeyrevoke", "joinlinkenable", "joinlinkset",
                "joinlinkreplace", "joinlinkoff", "courtnoticeset", "groupdescriptionset"];
  assert.deepEqual(plain(OPS.hostingaccessset), { classes: MP, machineClasses: ["admin", "probe"], mutating: true });
  for (const op of ACTS) {
    assert.deepEqual(plain(OPS[op]), plain(OPS.hostingaccessset), op);
    assert.ok(Object.hasOwn(NEEDS, op) && NEEDS[op] === null, op);
    assert.ok(both(op) && unfenced(op), op);
    assert.ok(stamps(op).includes("by") && !stamps(op).includes("bodyBy"), op);
    const calls = await drive(membershipOps, op, { query: { by: SENT } });
    assert.ok(JSON.stringify(calls).includes(SENT), `${op}: the query's by does not reach membership`);
  }
  for (const op of ["websiteinvite", "joinlinkinvite"]) {
    assert.deepEqual(plain(OPS[op]), { classes: null, mutating: true }, op);
    assert.deepEqual(stamps(op), [], op);
    assert.ok(neither(op) && !Object.hasOwn(NEEDS, op), op);
    /* the key or link is the body's: a query copy does not reach membership */
    const calls = await drive(membershipOps, op, { query: { key: SENT, link: SENT } });
    assert.ok(!JSON.stringify(calls).includes(SENT), op);
  }
  assert.deepEqual(plain(OPS.courtnotice), { classes: MP, mutating: false });
  assert.deepEqual(stamps("courtnotice"), []);
  assert.ok(!Object.hasOwn(NEEDS, "courtnotice"));
  assert.deepEqual(plain(OPS.groupdescription), { classes: null, mutating: false });
  assert.deepEqual(stamps("groupdescription"), ["viewer"]);
  assert.ok(neither("groupdescription") && !Object.hasOwn(NEEDS, "groupdescription"));
  assert.ok(JSON.stringify(await drive(membershipOps, "groupdescription", { query: { viewer: SENT } })).includes(SENT));
  /* R6: the store-internal routes membership serves (its R106's, read by tasks; `projectclaimowner`, K1864) */
  for (const op of ["checkaddressees", "projectclaimowner"]) assert.ok(inNoTable(op), op);
  /* negative control: a drifted spec */
  assert.notDeepEqual(plain({ ...OPS.joinlinkset, machineClasses: [] }), plain(OPS.hostingaccessset));
});

test("R23 (K1873): tasks' checkrequest, checktake and checkrecord mutating, contribute, a member session's only (machineClasses []), by (query) and viewer stamped; checkrequests and checksof reads, also a member session's only (machineClasses []), viewer stamped, a present null row; all in both session sets — every binding class arriving without a session is refused (negative control: an open read admits one)", () => {
  for (const op of ["checkrequest", "checktake", "checkrecord"]) {
    assert.deepEqual(plain(OPS[op]), { classes: ["admin", "member"], machineClasses: [], mutating: true }, op);
    assert.equal(NEEDS[op], "contribute", op);
    assert.deepEqual(stamps(op), ["by", "viewer"], op);
    assert.ok(both(op), op);
  }
  for (const op of ["checkrequests", "checksof"]) {
    assert.deepEqual(plain(OPS[op]), { classes: ["admin", "member"], machineClasses: [], mutating: false }, op);
    assert.ok(Object.hasOwn(NEEDS, op) && NEEDS[op] === null, op);
    assert.deepEqual(stamps(op), ["viewer"], op);
    assert.ok(both(op), op);
  }
  assert.deepEqual(OP_FAMILIES.tasks.actor, { key: "by", at: "query" });
  /* a caller not arriving by a session is judged against machineClasses: no binding class is admitted to any of the five */
  const BINDING = ["admin", "member", "probe", "daemon"];
  const machineAdmits = (op) => BINDING.filter((c) => (OPS[op].machineClasses ?? OPS[op].classes).includes(c));
  for (const op of ["checkrequest", "checktake", "checkrecord", "checkrequests", "checksof"]) assert.deepEqual(machineAdmits(op), [], op);
  /* negative control: an open read (checks' old posture) admits the bearers */
  assert.deepEqual(machineAdmits("timeline"), ["admin", "member", "probe"]);
});

test("R24, R20: the group's API key — groupkeyset, groupkeyremove, groupkeyswitch and groupswitchset an administrator's acts, groupkeystate and groupkeynotice reads, groupkeynoticeseen the member's own act — each a session's only (admin, member; machineClasses []), a present null row, both sets, by or viewer stamped as the owner reads them, in neither bearer fence and not on AI_GRANT_OPS; no other op names the key", async () => {
  const KEY = ["groupkeyset", "groupkeyremove", "groupkeyswitch", "groupswitchset", "groupkeystate", "groupkeynotice", "groupkeynoticeseen"];
  for (const op of KEY) {
    assert.deepEqual(plain(OPS[op]), { classes: ["admin", "member"], machineClasses: [],
      mutating: !["groupkeystate", "groupkeynotice"].includes(op) }, op);
    assert.ok(Object.hasOwn(NEEDS, op) && NEEDS[op] === null, op);
    assert.ok(both(op) && unfenced(op) && !AI_GRANT_OPS.includes(op), op);
  }
  for (const op of ["groupkeyset", "groupkeyremove", "groupkeyswitch", "groupswitchset", "groupkeynoticeseen"]) {
    assert.deepEqual(stamps(op), ["by", "viewer"], op);
    assert.ok(JSON.stringify(await drive(credentialsOps, op, { query: { by: SENT } })).includes(SENT), op);
  }
  for (const op of ["groupkeystate", "groupkeynotice"]) {
    assert.deepEqual(stamps(op), ["viewer"], op);
    assert.ok(JSON.stringify(await drive(credentialsOps, op, { query: { viewer: SENT } })).includes(SENT), op);
  }
  /* groupkeyset's key is a body field: the query's copy does not reach credentials */
  assert.ok(!JSON.stringify(await drive(credentialsOps, "groupkeyset", { query: { key: SENT } })).includes(SENT));
  assert.ok(JSON.stringify(await drive(credentialsOps, "groupkeyset", { body: { key: SENT } })).includes(SENT));
  /* R20: the key is reached through R24's acts only — no other op names it (network-notices' public read of the
     group's signing keys, `groupkeyspublic`, is no API key), and ask carries no key field */
  assert.deepEqual(Object.keys(OPS).filter((op) => /^group(key|switch)/.test(op) && op !== "groupkeyspublic").sort(), [...KEY].sort());
  assert.deepEqual(stamps("ask"), ["member", "viewer"]);
  assert.deepEqual(plain(OPS.ask), { classes: ["admin", "member"], machineClasses: [], mutating: true });
  for (const op of Object.keys(OPS)) assert.doesNotMatch(op, /^(group|project|instance)subscription|^project(account|claude|credential|key)/, op);
  /* T35 (R27, R30): the one subscription op is a member's own disconnection (credentials R43); the sign-in has no spec */
  assert.deepEqual(Object.keys(OPS).filter((op) => /subscription/.test(op)), ["subscriptiondisconnect"]);
  assert.equal(OP_FAMILIES.credentials.kinds.subscriptiondisconnect, "own");
  assert.ok(inNoTable("subscriptionsignin"));
});

test("R25: publishat with caseratify's gate — admin, member, probe, a member session's only (machineClasses []), NEEDS publish, both sets, caseratify's act lists and stamps; publishatmove and publishatcancel mutating, NEEDS publish, by stamped (query); publishschedule a read, viewer stamped, a present null; none in a bearer fence; each served by its owner (negative control)", async () => {
  assert.deepEqual(plain(OPS.publishat), { classes: plain(OPS.caseratify).classes, machineClasses: [], mutating: true });
  assert.equal(NEEDS.publishat, NEEDS.caseratify);
  assert.equal(NEEDS.publishat, "publish");
  assert.ok(both("publishat") && both("caseratify"));
  assert.deepEqual(listsOf("publishat"), listsOf("caseratify"));
  assert.deepEqual(stamps("publishat"), stamps("caseratify"));
  for (const op of ["publishatmove", "publishatcancel"]) {
    assert.deepEqual(plain(OPS[op]), { classes: MP, machineClasses: [], mutating: true }, op);
    assert.equal(NEEDS[op], "publish", op);
    assert.deepEqual(stamps(op), ["by", "viewer"], op);
    assert.ok(JSON.stringify(await drive(publicationOps, op, { query: { by: SENT } })).includes(SENT), op);
  }
  assert.deepEqual(plain(OPS.publishschedule), { classes: MP, machineClasses: [], mutating: false });
  assert.ok(Object.hasOwn(NEEDS, "publishschedule") && NEEDS.publishschedule === null);
  assert.deepEqual(stamps("publishschedule"), ["viewer"]);
  assert.ok(JSON.stringify(await drive(publicationOps, "publishschedule", { query: { viewer: SENT } })).includes(SENT));
  for (const op of ["publishat", "publishatmove", "publishatcancel", "publishschedule"]) assert.ok(both(op) && unfenced(op), op);
  /* publishat's `at` is the ceremony's body, read by ratification whole */
  assert.ok(JSON.stringify(await drive(ratificationOps, "publishat", { body: { at: { date: SENT } } })).includes(SENT));
  /* negative control */
  assert.ok(!JSON.stringify(await drive(publicationOps, "publishatmove", { query: { author: SENT } })).includes(SENT));
});

test("R26: placewanted an administrator's own session (officesseed's spec), by stamped; placewantedstate a session's read, viewer stamped, a present null; neither public nor reached by a machine credential", () => {
  assert.deepEqual(plain(OPS.placewanted), plain(OPS.officesseed));
  assert.deepEqual(plain(OPS.placewanted), { classes: ["admin", "member"], machineClasses: [], mutating: true });
  assert.ok(Object.hasOwn(NEEDS, "placewanted") && NEEDS.placewanted === null);
  assert.deepEqual(stamps("placewanted"), ["by", "viewer"]);
  assert.deepEqual(plain(OPS.placewantedstate), { classes: ["admin", "member"], machineClasses: [], mutating: false });
  assert.ok(Object.hasOwn(NEEDS, "placewantedstate") && NEEDS.placewantedstate === null);
  assert.deepEqual(stamps("placewantedstate"), ["viewer"]);
  for (const op of ["placewanted", "placewantedstate"]) assert.ok(both(op) && OPS[op].classes !== null, op);
});

test("R27 (T35; N701, K1869 (3)): DEC-148's library marks seven acts owed — memberlanguageset and startfrom (Welcome a new member), publishat (Publication ceremony), translationdraft and translationadopt (Translate the interface), subscriptionsignin and translationconfirm (optional scripts) — the first three declared under their own names, in both session sets; the four no owner serves in T35 given no spec and in no table", () => {
  const SERVED = ["memberlanguageset", "publishat", "startfrom"];
  const UNSERVED_OWED = ["subscriptionsignin", "translationadopt", "translationconfirm", "translationdraft"];
  for (const op of SERVED) assert.ok(Object.hasOwn(OPS, op) && both(op), op);
  for (const op of UNSERVED_OWED) assert.ok(inNoTable(op), op);
  const lib = JSON.stringify(JSON.parse(readFileSync(new URL("docs/development/ux-substrate/screens/library.json", ROOT), "utf8")));
  const owed = [...new Set([...lib.matchAll(/owed:([a-z]+)/g)].map((m) => m[1]))];
  assert.deepEqual(owed.sort(), [...SERVED, ...UNSERVED_OWED].sort());
  /* negative control: a declared op is not inNoTable */
  assert.ok(!inNoTable("publishat"));
});

test("R28: memberlanguageset a member's own act (admin, member, probe; machineClasses []), mutating, by stamped, a present null; memberlanguage and startfrom reads, viewer stamped, a present null; each in both sets and in neither bearer fence", () => {
  assert.deepEqual(plain(OPS.memberlanguageset), { classes: MP, machineClasses: [], mutating: true });
  assert.deepEqual(stamps("memberlanguageset"), ["by", "viewer"]);
  for (const op of ["memberlanguage", "startfrom"]) {
    assert.equal(OPS[op].mutating, false, op);
    assert.deepEqual(stamps(op), ["viewer"], op);
  }
  for (const op of ["memberlanguageset", "memberlanguage", "startfrom"]) {
    assert.ok(Object.hasOwn(NEEDS, op) && NEEDS[op] === null, op);
    assert.ok(both(op) && unfenced(op), op);
  }
});

test("R29: groupdescriptiondraft and writinghelp — a session's only (admin, member; machineClasses []), not mutating, by and viewer stamped, a present null row, both sets, in neither bearer fence, not on AI_GRANT_OPS; groupdescriptiondraft instance-setup's and writinghelp wizard-scripts'", () => {
  for (const op of ["groupdescriptiondraft", "writinghelp"]) {
    assert.deepEqual(plain(OPS[op]), { classes: ["admin", "member"], machineClasses: [], mutating: false }, op);
    assert.deepEqual(stamps(op), ["by", "viewer"], op);
    assert.ok(Object.hasOwn(NEEDS, op) && NEEDS[op] === null, op);
    assert.ok(both(op) && unfenced(op) && !AI_GRANT_OPS.includes(op), op);
  }
  assert.ok(Object.hasOwn(OP_FAMILIES["instance-setup"].kinds, "groupdescriptiondraft"));
  assert.ok(Object.hasOwn(OP_FAMILIES["wizard-scripts"].kinds, "writinghelp"));
});

test("R15: baseupdates a member session's read (admin, member; machineClasses []), viewer stamped, a present null row, in both session sets", () => {
  assert.deepEqual(plain(OPS.baseupdates), { classes: ["admin", "member"], machineClasses: [], mutating: false });
  assert.deepEqual(stamps("baseupdates"), ["viewer"]);
  assert.ok(Object.hasOwn(NEEDS, "baseupdates") && NEEDS.baseupdates === null && both("baseupdates"));
});

test("R19 (K1807): hypotheses' notes — notewrite and noteturn a member's (machineClasses []), contribute, by stamped from the body, notes a read stamped viewer — each reaching hypotheses where it reads it", async () => {
  for (const op of ["notewrite", "noteturn"]) {
    assert.equal(OP_FAMILIES.hypotheses.kinds[op], "member", op);
    assert.deepEqual(plain(OPS[op]), { classes: ["admin", "member"], machineClasses: [], mutating: true }, op);
    assert.equal(NEEDS[op], "contribute", op);
    assert.deepEqual(stamps(op), ["bodyBy", "viewer"], op);
    assert.ok(JSON.stringify(await drive(hypothesesOps, op, { body: { by: SENT } })).includes(SENT), op);
  }
  assert.equal(OP_FAMILIES.hypotheses.kinds.notes, "read");
  assert.deepEqual(stamps("notes"), ["viewer"]);
  assert.ok(JSON.stringify(await drive(hypothesesOps, "notes", { query: { viewer: SENT } })).includes(SENT));
});

test("R3 (K1805): askusage's recorded decision names calls beside usage", () => {
  assert.match(UNATTENDED_BY_DECISION.askusage, /usage/);
  assert.match(UNATTENDED_BY_DECISION.askusage, /`calls` beside `usage`/);
});
