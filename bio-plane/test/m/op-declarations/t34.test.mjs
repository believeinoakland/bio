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
import { publishScheduleOps } from "../../../src/publish-schedule/index.mjs";
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

/* R21 (T37; DEC-182 (1), (4)): the registry as PR #14 left it names no function no op serves. The five T34 named back
   to BOB are gone from its functions: four withdrawn, their buttons re-pointed to declared ops, and `setpassword` an
   owed act declared under its own name (R39). */
const UNSERVED = [];
const WITHDRAWN = { projectcreated: "promote", countask: "calculationcreate", registerproceeding: "entitycreate",
                    deadlinecompute: "clockpropose" };

test("R21, R5: every act the screen registry marks `function` is an op under its lowercased name — already an op, or an alias in the one frozen table OP_ALIASES — and on PR #14's registry no function is unserved: the four DEC-182 (1) withdraws are no function and no op, their buttons' ops declared, and setpassword is owed (negative control: an unaliased name is seen)", () => {
  const fns = actsOf("function");
  /* T41: the registry as PR #19 left it (`wizard-scripts` R13, K2484) names 58 distinct functions */
  assert.ok(fns.length >= 55, `${fns.length} functions`);
  for (const f of fns) {
    assert.equal(f, f.toLowerCase(), f);
    if (UNSERVED.includes(f)) assert.ok(inNoTable(f), `${f} is served by no op and must have no spec`);
    else assert.ok(Object.hasOwn(OPS, f), `${f}: no spec`);
  }
  for (const f of UNSERVED) assert.ok(fns.includes(f), `${f} is no registry function`);
  for (const [f, op] of Object.entries(WITHDRAWN)) {
    assert.ok(!fns.includes(f) && inNoTable(f), `${f} is still a function or has a spec`);
    assert.ok(Object.hasOwn(OPS, op), `${op}: no spec`);
  }
  assert.ok(!fns.includes("setpassword") && actsOf("owed").some((a) => a.startsWith("owed:setpassword ")));
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
  assert.ok(checked >= 21, `${checked} aliases driven`);
  /* the four outside the families are the act lists' (their owners' arms read in J1: credentials' signerRegisterOwn and
     signerRevokeOwn, reevaluation's adoptVersion and keepVersion, strength's strengthBarSet, filings' filingRecordSent) */
  assert.deepEqual(Object.keys(OP_ALIASES).length - checked, 6);
  /* negative control */
  const calls = await drive(eventsOps, "eventmerge");
  assert.ok(!calls.some(([k]) => String(k).toLowerCase() === "createevent"));
});

test("R21, R27 (K1901; T36, K2084; T37, K2159, K2171; T38, K2300): an act the registry marks `owed` is no op until its ruling's op is declared under its own name, and then it is that op, read as served with no alias made — on PR #14's registry the ten T34's and T35's ops declare, the nine R32 and R33 declare the eight T37 declares (R35–R39) and, on PR #15's registry, R40's obscuremarkwithdraw (T38), `owed:placewanted` gone; no spec names `owed:`; infolevelset, the one owed act no owner serves, has no spec", () => {
  for (const op of Object.keys(OPS)) assert.ok(!op.includes(":") && !op.includes(" "), op);
  const owed = actsOf("owed").map((a) => a.replace(/^owed:/, "").split(" ")[0]);
  /* the registry as PR #13 left it (T36): the owed acts whose ops this module declares under those names — T34's and
     T35's ten, and the nine R32 and R33 declare (DEC-168–DEC-173); the registry no longer marks `placewanted` */
  const DECLARED = ["archivelist", "findin", "groupdescriptiondraft", "memberlanguageset", "notedelete", "noterevise",
                    "publishat", "securitymap", "startfrom", "writinghelp",
                    "aikeepaway", "deepercheck", "openoriginal", "openwithwarning", "releasescanhold", "safeview",
                    "securitytooladd", "securitytooltest", "securitytoolremove",
                    /* T37 (PR #14, `e08cd35ecb`): R38's, R39's, R36's and the five translation acts of R35 and R37 */
                    "obscuremark", "setpassword", "subscriptionsignin", "translationadopt", "translationconfirm",
                    "translationdraft", "translationgrant", "translationrevert",
                    /* T38 (PR #15, `c848b56671`): R40's */
                    "obscuremarkwithdraw",
                    /* T41 (PR #19, `3660c18803`; DEC-184, DEC-186, DEC-188): R41's nine and R42's two */
                    "accountusesset", "ailimitset", "exploreapprove", "projectaccountremove", "projectaccountswitch",
                    "projectaikeepaway", "projectkeynoticeseen", "projectkeyset", "projectsigninset",
                    "handlecheck", "handlechange"];
  assert.ok(!owed.includes("placewanted") && Object.hasOwn(OPS, "placewanted"));
  /* and the one owed act no owner serves in T37 and T38 */
  const UNDECLARED = ["infolevelset"];
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

test("R24, R20 (T41, DEC-188 (8): groupswitchset retired to R41's accountusesset): the group's API key — groupkeyset, groupkeyremove and groupkeyswitch an administrator's acts, groupkeystate and groupkeynotice reads, groupkeynoticeseen the member's own act — each a session's only (admin, member; machineClasses []), a present null row, both sets, by or viewer stamped as the owner reads them, in neither bearer fence and not on AI_GRANT_OPS; groupswitchset has no spec and is in no table; no other op names the key (negative control: credentials' map no longer serves the retired act)", async () => {
  const KEY = ["groupkeyset", "groupkeyremove", "groupkeyswitch", "groupkeystate", "groupkeynotice", "groupkeynoticeseen"];
  for (const op of KEY) {
    assert.deepEqual(plain(OPS[op]), { classes: ["admin", "member"], machineClasses: [],
      mutating: !["groupkeystate", "groupkeynotice"].includes(op) }, op);
    assert.ok(Object.hasOwn(NEEDS, op) && NEEDS[op] === null, op);
    assert.ok(both(op) && unfenced(op) && !AI_GRANT_OPS.includes(op), op);
  }
  for (const op of ["groupkeyset", "groupkeyremove", "groupkeyswitch", "groupkeynoticeseen"]) {
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
  /* T41 (DEC-188 (8); K2484): the group's switches are set only by R41's accountusesset (`owner` group) */
  assert.ok(inNoTable("groupswitchset"), "groupswitchset is declared");
  assert.ok(!Object.keys(credentialsOps({}, new URL("http://plane/"), {}, {}, {})).includes("groupswitchset"));
  assert.ok(Object.hasOwn(OPS, "accountusesset"));
  /* R20: the key is reached through R24's acts only — no other op names it (network-notices' public read of the
     group's signing keys, `groupkeyspublic`, is no API key), and ask carries no key field */
  assert.deepEqual(Object.keys(OPS).filter((op) => /^group(key|switch)/.test(op) && op !== "groupkeyspublic").sort(), [...KEY].sort());
  assert.deepEqual(stamps("ask"), ["member", "viewer"]);
  assert.deepEqual(plain(OPS.ask), { classes: ["admin", "member"], machineClasses: [], mutating: true });
  /* no op names a group- or project-level subscription; a project's account (R41) is an API key or one owner's sign-in */
  for (const op of Object.keys(OPS)) assert.doesNotMatch(op, /^(group|project|instance)subscription|^project(claude|credential)/, op);
  /* T35 (R27, R30): the member's own disconnection (credentials R43); T37 (R36): and their own sign-in — the two
     subscription ops, each a member's own act, neither a group's or a project's */
  assert.deepEqual(Object.keys(OPS).filter((op) => /subscription/.test(op)).sort(), ["subscriptiondisconnect", "subscriptionsignin"]);
  assert.equal(OP_FAMILIES.credentials.kinds.subscriptiondisconnect, "own");
  assert.equal(OP_FAMILIES.credentials.kinds.subscriptionsignin, "own");
  /* negative control: a retired name added back would be seen */
  assert.ok(!inNoTable("groupkeyswitch"));
});

test("R25 (T41; N823, K2438: served by ratification and publish-schedule): publishat with caseratify's gate — admin, member, probe, a member session's only (machineClasses []), NEEDS publish, both sets, caseratify's act lists and stamps, served by ratification's map; publishatmove and publishatcancel mutating, NEEDS publish, by stamped (query); publishschedule a read, viewer stamped, a present null — the three in publish-schedule's family and served by its map (publish-schedule R3, R4); none in a bearer fence (negative control)", async () => {
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
    assert.ok(JSON.stringify(await drive(publishScheduleOps, op, { query: { by: SENT } })).includes(SENT), op);
  }
  assert.deepEqual(plain(OPS.publishschedule), { classes: MP, machineClasses: [], mutating: false });
  assert.ok(Object.hasOwn(NEEDS, "publishschedule") && NEEDS.publishschedule === null);
  assert.deepEqual(stamps("publishschedule"), ["viewer"]);
  assert.ok(JSON.stringify(await drive(publishScheduleOps, "publishschedule", { query: { viewer: SENT } })).includes(SENT));
  for (const op of ["publishatmove", "publishatcancel", "publishschedule"])
    assert.equal(OP_FAMILIES["publish-schedule"].kinds[op] !== undefined && !Object.hasOwn(OP_FAMILIES, "publication"), true, op);
  for (const op of ["publishat", "publishatmove", "publishatcancel", "publishschedule"]) assert.ok(both(op) && unfenced(op), op);
  /* publishat's `at` is the ceremony's body, read by ratification whole */
  assert.ok(JSON.stringify(await drive(ratificationOps, "publishat", { body: { at: { date: SENT } } })).includes(SENT));
  /* negative control */
  assert.ok(!JSON.stringify(await drive(publishScheduleOps, "publishatmove", { query: { author: SENT } })).includes(SENT));
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

test("R27 (T35; N701, K1869 (3); T37, its T35 and T36 sentences retired): DEC-148's library marks seven acts owed — memberlanguageset and startfrom (Welcome a new member), publishat (Publication ceremony), translationdraft and translationadopt (Translate the interface), subscriptionsignin and translationconfirm (optional scripts) — and all seven are declared under their own names, in both session sets", () => {
  const SERVED = ["memberlanguageset", "publishat", "startfrom"];
  /* T37: served now (R35, R36, R37) */
  const UNSERVED_OWED = ["subscriptionsignin", "translationadopt", "translationconfirm", "translationdraft"];
  for (const op of [...SERVED, ...UNSERVED_OWED]) assert.ok(Object.hasOwn(OPS, op) && both(op), op);
  for (const op of [...SERVED, ...UNSERVED_OWED]) assert.ok(!Object.hasOwn(OP_ALIASES, op) && !Object.values(OP_ALIASES).includes(op), op);
  const lib = JSON.stringify(JSON.parse(readFileSync(new URL("docs/development/ux-substrate/screens/library.json", ROOT), "utf8")));
  const owed = [...new Set([...lib.matchAll(/owed:([a-z]+)/g)].map((m) => m[1]))];
  /* the library file as PR #14 left it also marks two acts owed by later rulings, each declared under its own name:
     `aikeepaway` (DEC-172; R33) and `obscuremark` (DEC-180; R38); as PR #19 left it (T41; DEC-188), two more, R41's
     `ailimitset` and `accountusesset` */
  const LATER = ["aikeepaway", "obscuremark", "ailimitset", "accountusesset"];
  for (const op of LATER) assert.ok(Object.hasOwn(OPS, op) && both(op) && !Object.hasOwn(OP_ALIASES, op), op);
  assert.deepEqual(owed.sort(), [...SERVED, ...UNSERVED_OWED, ...LATER].sort());
  /* negative control: a declared op is not inNoTable, an undeclared one is */
  assert.ok(!inNoTable("publishat") && inNoTable("infolevelset"));
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
