/* op-declarations R17–R20 (T33-88; K1122): the op families of T33's new modules and the ops T33 adds to earlier ones,
   one append site each (`OP_FAMILIES`). Each family is checked whole against its owner: the specs and rows its kinds
   give, both session sets, the stamps it names (driven through the owner's own ops map, so a stamp named at the wrong
   site or key is seen), and R6's totality between the owner's map and the tables. Each comparison has a negative
   control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as O from "../../../src/op-declarations/index.mjs";
import { eventsOps } from "../../../src/events/index.mjs";
import { linesOps } from "../../../src/lines/index.mjs";
import { moneyOps } from "../../../src/money/index.mjs";
import { moneyChecksOps } from "../../../src/money-checks/index.mjs";
import { dutiesOps } from "../../../src/duties/index.mjs";
import { peopleOps } from "../../../src/people/index.mjs";
import { exploreOps } from "../../../src/explore/ops.mjs";
import { hypothesesOps } from "../../../src/hypotheses/index.mjs";
import { calculationsOps } from "../../../src/calculations/index.mjs";
import { workbooksOps } from "../../../src/workbooks/ops.mjs";
import { answersOps } from "../../../src/answers/ops.mjs";
import { followingOps } from "../../../src/following/index.mjs";
import { standardsOps } from "../../../src/standards/index.mjs";
import { credentialsOps } from "../../../src/credentials/index.mjs";
import { sourcesOps } from "../../../src/sources/index.mjs";
import { entitiesOps } from "../../../src/entities/index.mjs";
import { aiRunsOps } from "../../../src/ai-runs/index.mjs";
import { inquiryOps } from "../../../src/inquiry/index.mjs";
import { corpusExportOps } from "../../../src/corpus-export/index.mjs";
import { actionsOps } from "../../../src/actions/index.mjs";
import { actionClocksOps } from "../../../src/action-clocks/index.mjs";
import { captureRequestsOps } from "../../../src/capture-requests/index.mjs";
import { membershipOps } from "../../../src/membership/index.mjs";
import { tasksOps } from "../../../src/tasks/index.mjs";
import { publicationOps } from "../../../src/publication/index.mjs";
import { wizardScriptsOps } from "../../../src/wizard-scripts/index.mjs";

const { OPS, SESSION_OPS, NEEDS, UNATTENDED_BY_DECISION, ACT_GATE, OP_FAMILIES, OP_KINDS, FAMILY_OPS, ASK_GRANT_OPS,
        OP_STAMPS, OP_ALIASES } = O;
/* T34's kinds that stamp nothing of their own (R22): their ops take only the family's extras */
const unstamped = (f, op) => OP_KINDS[f.kinds[op]].stamped === false;
const MP = ["admin", "member", "probe"];
const plain = (s) => ({ ...s, ...(Array.isArray(s.classes) ? { classes: [...s.classes] } : {}),
                        ...(Array.isArray(s.machineClasses) ? { machineClasses: [...s.machineClasses] } : {}) });
const both = (op) => SESSION_OPS.member.has(op) && SESSION_OPS.admin.has(op);

/* Every owner's ops map, built over a recording service: each method the arm calls answers {ok:true} and keeps the
   arguments it was handed, so a stamp the arm passes on is seen where the owner reads it. */
const MAPS = { events: eventsOps, lines: linesOps, money: moneyOps, "money-checks": moneyChecksOps, duties: dutiesOps,
  people: peopleOps, explore: exploreOps, hypotheses: hypothesesOps, calculations: calculationsOps, workbooks: workbooksOps,
  answers: answersOps, following: followingOps, standards: standardsOps, credentials: credentialsOps, sources: sourcesOps,
  entities: entitiesOps, "ai-runs": aiRunsOps, inquiry: inquiryOps, "corpus-export": corpusExportOps, actions: actionsOps,
  "action-clocks": actionClocksOps, "capture-requests": captureRequestsOps, membership: membershipOps, tasks: tasksOps,
  publication: publicationOps, "wizard-scripts": wizardScriptsOps };
const recorder = () => {
  const calls = [];
  const fn = (...args) => { calls.push(args); return { ok: true }; };
  const svc = new Proxy({}, { get: (_, k) => (k === "then" ? undefined : k === Symbol.toPrimitive ? () => "" : fn) });
  return { svc, calls };
};
const build = (owner, url = new URL("http://plane/"), body = {}) => {
  const r = recorder();
  return { map: MAPS[owner](r.svc, url, body, r.svc, r.svc), calls: r.calls };
};
const servedBy = (owner) => Object.keys(build(owner).map);

/* The ops served in process only, never routed to a caller (R6's store-internal routes): inquiry's two (inquiry's
   Callers' obligations: the control plane routes neither), entities' plan read, credentials' three the plane's own
   admission and login call. */
const IN_PROCESS = { inquiry: ["basis", "restson"], entities: ["readingnameplan"],
                     credentials: ["aicredentiallook", "setpassword", "session"],
                     /* T34 (R22, R6): the check's addressees, read by tasks in process (membership R106) */
                     membership: ["checkaddressees",
                       /* membership's own hop, called inside `projectCreated` (R6's store-internal list, K1864) */
                       "projectclaimowner"],
                     /* publication's internal hops (its R15; D-734) and its reads served by public-read */
                     publication: ["recordcasemanifest", "publishedtargets", "casedocfacts", "publishedcasedoctext"] };
/* The family ops whose arm another L11 job serves (R6's other half holds at the layer's close): the control plane
   routes these to their owner's in-process services (K1601; action-clocks R2's `clockpropose`, capture-requests R46,
   answers' `ask`), instance-setup builds its two (T33-87). */
const SERVED_ELSEWHERE = { clockpropose: "control-plane (T33-89)", capturerequestplatformmark: "control-plane (T33-89)",
  capturerequestplatformunmark: "control-plane (T33-89)", capturerequestplatformhosts: "control-plane (T33-89)",
  ask: "control-plane (T33-89)", officesseed: "instance-setup (T33-87)", seatsseed: "instance-setup (T33-87)",
  assistantset: "instance-setup (T33-87)", assistantstate: "instance-setup (T33-87)",
  disclosureshown: "instance-setup (T33-87)", disclosureof: "instance-setup (T33-87)",
  /* T34's ops whose owners' L11 jobs build them beside this one (their merges come first in L11's order) */
  placewanted: "instance-setup (T34-81)", placewantedstate: "instance-setup (T34-81)",
  memberlanguageset: "instance-setup (T34-81)", memberlanguage: "instance-setup (T34-81)",
  groupdescriptiondraft: "instance-setup (T34-90)",
  /* the door routes it itself, calling wizard-scripts' `writingHelp` with the assistant it resolves (K1863 (7)) */
  writinghelp: "control-plane (T34-60)" };

test("R19, R17, R18, R20, R5: OP_FAMILIES holds one frozen entry per owner — owner, citation, the actor and proposer stamps as {key, at}, its kinds, and the acts, proposals and reads derived from them — each op in exactly one family and every kind one of OP_KINDS", () => {
  assert.deepEqual(Object.keys(OP_FAMILIES).sort(), ["action-clocks", "actions", "ai-runs", "answers", "calculations",
    "capture-requests", "corpus-export", "credentials", "duties", "entities", "events", "explore", "following", "hypotheses",
    "inquiry", "instance-setup", "lines", "membership", "money", "money-checks", "people", "publication", "sources",
    "standards", "tasks", "wizard-scripts", "workbooks"]);
  assert.deepEqual(Object.keys(OP_KINDS).sort(), ["admin", "door", "member", "open", "own", "ownread", "plainread",
    "proposal", "public", "publishact", "read", "roster", "sessionact", "sessionread", "tally"]);
  const seen = new Set();
  for (const [owner, f] of Object.entries(OP_FAMILIES)) {
    for (const v of [f, f.kinds, f.acts, f.proposals, f.reads, f.extra, ...Object.values(f.extra)]) assert.ok(Object.isFrozen(v), owner);
    for (const op of Object.keys(f.extra)) assert.ok(Object.hasOwn(f.kinds, op), `${owner}: an extra stamp on ${op}, no op`);
    assert.equal(f.owner, owner);
    assert.ok(typeof f.cite === "string" && f.cite.length > 3, owner);
    for (const st of [f.actor, f.proposer].filter(Boolean)) {
      assert.ok(Object.isFrozen(st), owner);
      assert.deepEqual(Object.keys(st).sort(), ["at", "key"], owner);
      assert.ok(["query", "body"].includes(st.at), owner);
      assert.ok(["by", "author", "proposer", "viewer"].includes(st.key), `${owner}: ${st.key}`);
    }
    const ops = Object.keys(f.kinds);
    for (const op of ops) {
      assert.ok(!seen.has(op), `${op} in two families`);
      seen.add(op);
      assert.ok(Object.hasOwn(OP_KINDS, f.kinds[op]), op);
    }
    const kind = (op) => OP_KINDS[f.kinds[op]];
    assert.deepEqual([...f.acts], ops.filter((op) => kind(op).spec.mutating && f.kinds[op] !== "proposal"), owner);
    assert.deepEqual([...f.proposals], ops.filter((op) => f.kinds[op] === "proposal"), owner);
    assert.deepEqual([...f.reads], ops.filter((op) => !kind(op).spec.mutating), owner);
    /* an act needs an actor stamp unless it reads only the viewer; a proposal its proposer */
    if (f.acts.some((op) => !unstamped(f, op)) && owner !== "corpus-export") assert.ok(f.actor, `${owner} names no actor`);
    if (f.proposals.length) assert.ok(f.proposer, `${owner} names no proposer`);
  }
  assert.deepEqual([...FAMILY_OPS].sort(), [...seen].sort());
  assert.ok(Object.isFrozen(FAMILY_OPS) && Object.isFrozen(OP_KINDS));
  for (const k of Object.values(OP_KINDS)) assert.ok(Object.isFrozen(k), "kind");
});

test("R19, R2, R3: every family op has the spec and NEEDS row its kind gives — open and proposal admin, member, probe, mutating, contribute; member a session's only (machineClasses []), contribute; admin and own a session's only, a present null; tally mutating, null; read admin, member, probe, null; ownread a session's only, null — in both session sets, none naming ai, none unattended (negative control: a drifted spec or row is seen)", () => {
  const want = {
    open: [{ classes: MP, mutating: true }, "contribute"],
    proposal: [{ classes: MP, mutating: true }, "contribute"],
    member: [{ classes: ["admin", "member"], machineClasses: [], mutating: true }, "contribute"],
    admin: [{ classes: ["admin", "member"], machineClasses: [], mutating: true }, null],
    own: [{ classes: ["admin", "member"], machineClasses: [], mutating: true }, null],
    tally: [{ classes: MP, mutating: true }, null],
    read: [{ classes: MP, mutating: false }, null],
    ownread: [{ classes: ["admin", "member"], machineClasses: [], mutating: false }, null],
    /* T34 (R22, R25, R28): `undefined` is no NEEDS row */
    roster: [{ classes: MP, machineClasses: ["admin", "probe"], mutating: true }, null],
    publishact: [{ classes: MP, machineClasses: [], mutating: true }, "publish"],
    sessionact: [{ classes: MP, machineClasses: [], mutating: true }, null],
    sessionread: [{ classes: MP, machineClasses: [], mutating: false }, null],
    door: [{ classes: null, mutating: true }, undefined],
    public: [{ classes: null, mutating: false }, undefined],
    plainread: [{ classes: MP, mutating: false }, undefined],
  };
  const PUBLIC = ["door", "public"];
  let n = 0;
  for (const f of Object.values(OP_FAMILIES)) for (const [op, k] of Object.entries(f.kinds)) {
    n++;
    assert.ok(Object.hasOwn(OPS, op), `${op} has no spec`);
    assert.deepEqual(plain(OPS[op]), want[k][0], op);
    if (want[k][1] === undefined) assert.ok(!Object.hasOwn(NEEDS, op), `${op} has a NEEDS row`);
    else {
      assert.ok(Object.hasOwn(NEEDS, op), `${op} has no NEEDS row`);
      assert.equal(NEEDS[op], want[k][1], op);
    }
    assert.equal(ACT_GATE.needs(op), want[k][1] ?? null, op);
    assert.ok(!JSON.stringify(OPS[op]).includes('"ai"'), op);
    assert.ok(!Object.hasOwn(UNATTENDED_BY_DECISION, op), op);
    if (PUBLIC.includes(k)) {
      assert.ok(!SESSION_OPS.member.has(op) && !SESSION_OPS.admin.has(op), `${op} is public and in a session set`);
      continue;
    }
    assert.ok(both(op), `${op} is not in both session sets`);
    assert.equal(ACT_GATE.mode(op), "session", op);
    assert.ok(!JSON.stringify(OPS[op]).includes('"ai"'), op);
    assert.ok(!Object.hasOwn(UNATTENDED_BY_DECISION, op), op);
    assert.ok(Object.isFrozen(OPS[op]) && Object.isFrozen(OPS[op].classes), op);
  }
  for (const op of Object.keys(OP_FAMILIES.membership.kinds).filter((o) => PUBLIC.includes(OP_FAMILIES.membership.kinds[o])))
    assert.ok(Object.isFrozen(OPS[op]), op);
  assert.ok(n >= 180, `${n} family ops`);
  /* negative controls */
  assert.notDeepEqual(plain({ ...OPS.eventmerge, machineClasses: undefined }), want.member[0]);
  assert.notDeepEqual(plain({ ...OPS.timeline, mutating: true }), want.read[0]);
});

test("R19, R6: each new module's ops map and each family's share of an earlier module's map — every op the owner serves to a caller has a spec, every family op is served by its owner's map or by the named L11 job, and the in-process routes have no spec (negative control: an op added to a map without a spec is seen)", () => {
  const NEW = ["events", "lines", "money", "money-checks", "duties", "people", "explore", "hypotheses", "calculations",
               "workbooks", "answers", "following"];
  for (const owner of Object.keys(MAPS)) {
    const served = servedBy(owner);
    const internal = IN_PROCESS[owner] ?? [];
    for (const op of internal) {
      assert.ok(served.includes(op), `${owner}: ${op}`);
      assert.ok(!Object.hasOwn(OPS, op) && !Object.hasOwn(NEEDS, op) && !SESSION_OPS.member.has(op), `${op} is specced`);
    }
    for (const op of served.filter((o) => !internal.includes(o))) assert.ok(Object.hasOwn(OPS, op), `${owner}: ${op} has no spec`);
    const fam = OP_FAMILIES[owner];
    if (NEW.includes(owner)) {
      /* a new module's whole map is its family, but for the ops another job serves */
      const unserved = Object.keys(fam.kinds).filter((op) => !served.includes(op));
      assert.deepEqual(unserved, unserved.filter((op) => Object.hasOwn(SERVED_ELSEWHERE, op)), owner);
      assert.deepEqual(served.filter((op) => !Object.hasOwn(fam.kinds, op)).sort(),
                       owner === "money-checks" ? ["moneydetectorsrun"] : [], owner);
    }
    if (fam) for (const op of Object.keys(fam.kinds))
      assert.ok(served.includes(op) || Object.hasOwn(SERVED_ELSEWHERE, op), `${owner}: ${op} is declared and served by nobody`);
  }
  /* the families no map holds are instance-setup's (its job builds them) */
  for (const op of Object.keys(OP_FAMILIES["instance-setup"].kinds)) assert.match(SERVED_ELSEWHERE[op], /instance-setup/);
  /* T34: membership's, publication's and credentials' new ops are served by their merged owners now */
  for (const op of [...Object.keys(OP_FAMILIES.membership.kinds), ...Object.keys(OP_FAMILIES.publication.kinds),
                    "groupkeyset", "groupkeyremove", "groupkeyswitch", "groupswitchset", "groupkeystate", "groupkeynotice",
                    "groupkeynoticeseen", "notewrite", "noteturn", "notes"])
    assert.ok(!Object.hasOwn(SERVED_ELSEWHERE, op), op);
  /* each named exception is a family op its owner's map does not yet serve */
  for (const op of Object.keys(SERVED_ELSEWHERE)) {
    assert.ok(FAMILY_OPS.includes(op), op);
    const owner = Object.values(OP_FAMILIES).find((f) => Object.hasOwn(f.kinds, op)).owner;
    if (MAPS[owner]) assert.ok(!servedBy(owner).includes(op), `${op} is served now: drop it from SERVED_ELSEWHERE`);
  }
  /* negative control: an op added to a map without a spec is found */
  assert.deepEqual([...servedBy("explore"), "explorewander"].filter((op) => !Object.hasOwn(OPS, op)), ["explorewander"]);
});

/* Driving an arm: the stamp is given at one site and the other is left empty, so the sentinel reaches the owner only
   when the family names the site the owner reads. */
const SENT = "member:sentinel-7f3a";
/* the arguments an arm needs before it reaches its owner at all (a preset is named, R10) */
const ARGS = { explorepreset: { preset: "chain" } };
const reaches = async (owner, op, st) => {
  const url = new URL("http://plane/");
  for (const [k, v] of Object.entries(ARGS[op] ?? {})) url.searchParams.set(k, v);
  const body = {};
  (st.at === "query" ? url.searchParams : { set: (k, v) => { body[k] = v; } }).set(st.key, SENT);
  const { map, calls } = build(owner, url, body);
  try { await map[op](); } catch { /* an arm that throws past the recorder still recorded its call */ }
  return JSON.stringify(calls).includes(SENT);
};

test("R19, R4: each family's actor stamp reaches its owner on every act, and its proposer stamp on every proposal, at the site and key the family names; a key the owner does not read, or a body owner's query, does not (negative control), so the door that stamps by this table stamps what the owner reads", async () => {
  let checked = 0;
  for (const [owner, f] of Object.entries(OP_FAMILIES)) {
    if (!MAPS[owner]) continue;
    const served = servedBy(owner);
    const pairs = [...f.acts.map((op) => [op, f.actor]), ...f.proposals.map((op) => [op, f.proposer])]
      .filter(([op, st]) => st && served.includes(op) && !unstamped(f, op));
    for (const [op, st] of pairs) {
      assert.ok(await reaches(owner, op, st), `${owner}.${op}: ${st.key} in the ${st.at} does not reach the owner`);
      /* negative controls: at the query, a key the owner does not read does not reach; an owner that reads the body
         ignores the query, so the same stamp there does not reach (an owner that reads the query may also pass its
         body through, so the body is no control for it) */
      assert.equal(await reaches(owner, op, { key: "nosuchstamp", at: "query" }), false, `${owner}.${op}: any key reaches`);
      if (st.at === "body")
        assert.equal(await reaches(owner, op, { key: st.key, at: "query" }), false, `${owner}.${op}: the query's ${st.key} reaches`);
      checked++;
    }
  }
  assert.ok(checked >= 70, `${checked} stamps driven`);
});

test("R19, R4: every family read is stamped with the viewer, and the owner reads it from the query: the viewer reaches the owner on each served read that names a subject by sight (negative control: under another key it does not)", async () => {
  /* reads that take no viewer by their owner's requirement: events' act-to-event alias (R21), money-checks' parameter
     list (R3) and the keyed services list (credentials R29); the door stamps it on them all the same */
  const NO_VIEWER = ["eventforact", "moneycheckparams", "keyedservices"];
  let checked = 0;
  for (const [owner, f] of Object.entries(OP_FAMILIES)) {
    if (!MAPS[owner]) continue;
    const served = servedBy(owner);
    for (const op of f.reads.filter((o) => served.includes(o) && !NO_VIEWER.includes(o) && !unstamped(f, o))) {
      assert.ok(await reaches(owner, op, { key: "viewer", at: "query" }), `${owner}.${op}: the viewer does not reach`);
      assert.equal(await reaches(owner, op, { key: "nosuchstamp", at: "query" }), false, `${owner}.${op}: any key reaches`);
      checked++;
    }
  }
  assert.ok(checked >= 70, `${checked} reads`);
});

/* K1674, K1683: the stamp interface — op → keys from the closed set the control plane implements once each. */
const STAMP_KEYS = ["viewer", "by", "bodyBy", "author", "proposer", "member", "session"];
const keyOf = (st) => (!st || st.key === "viewer" ? null : st.key === "by" ? (st.at === "body" ? "bodyBy" : "by") : st.key);

test("R19, R4, R5 (K1674, K1683): OP_STAMPS maps every op this module declares for T33 — each family op, the ask's three plane ops, exportpage and moneydetectorsrun, and no other — to frozen stamp keys from the closed set viewer, by, bodyBy, author, proposer, member, session: viewer on every family op, the family's actor key on each act (by at the query, bodyBy at the body), its proposer key on each proposal, the family's extras, the grant's member as viewer on the ask ops (negative control: a drifted key is seen)", () => {
  assert.ok(Object.isFrozen(OP_STAMPS));
  /* T34 (R21): an alias of a stamped op carries its op's stamps */
  const aliased = Object.keys(OP_ALIASES).filter((al) => FAMILY_OPS.includes(OP_ALIASES[al]));
  assert.deepEqual(Object.keys(OP_STAMPS).sort(), [...FAMILY_OPS, ...ASK_GRANT_OPS, "exportpage", "moneydetectorsrun", ...aliased].sort());
  for (const al of aliased) assert.deepEqual([...OP_STAMPS[al]], [...OP_STAMPS[OP_ALIASES[al]]], al);
  for (const [op, keys] of Object.entries(OP_STAMPS)) {
    assert.ok(Object.isFrozen(keys) && Array.isArray(keys), op);
    assert.equal(new Set(keys).size, keys.length, op);
    for (const k of keys) assert.ok(STAMP_KEYS.includes(k), `${op}: ${k}`);
    assert.ok(Object.hasOwn(OPS, op), op);
  }
  for (const f of Object.values(OP_FAMILIES)) for (const op of Object.keys(f.kinds)) {
    if (unstamped(f, op)) { assert.deepEqual([...OP_STAMPS[op]], [...(f.extra[op] ?? [])], op); continue; }
    const who = f.acts.includes(op) ? keyOf(f.actor) : f.proposals.includes(op) ? keyOf(f.proposer) : null;
    assert.deepEqual([...OP_STAMPS[op]].sort(), [...new Set(["viewer", ...(who ? [who] : []), ...(f.extra[op] ?? [])])].sort(), op);
  }
  /* the shapes the control plane named (K1674): query by, body by, the viewer alone, author, member and session */
  assert.deepEqual([...OP_STAMPS.eventcreate], ["viewer", "by"]);
  assert.deepEqual([...OP_STAMPS.moneyrecord], ["viewer", "bodyBy"]);
  assert.deepEqual([...OP_STAMPS.tabledeclare], ["viewer"]);
  assert.deepEqual([...OP_STAMPS.clockadopt], ["viewer", "author"]);
  assert.deepEqual([...OP_STAMPS.clockpropose], ["viewer", "proposer"]);
  assert.deepEqual([...OP_STAMPS.dutypropose], ["viewer", "by"]);
  assert.deepEqual([...OP_STAMPS.aigrantmint], ["viewer", "by", "member", "session"]);
  assert.deepEqual([...OP_STAMPS.accountreference], ["viewer", "member"]);
  assert.deepEqual([...OP_STAMPS.ask], ["viewer", "member"]);
  for (const op of ASK_GRANT_OPS) assert.deepEqual([...OP_STAMPS[op]], ["viewer"], op);
  assert.deepEqual([...OP_STAMPS.exportpage], []);
  assert.deepEqual([...OP_STAMPS.moneydetectorsrun], []);
  for (const op of OP_FAMILIES.lines.reads) assert.deepEqual([...OP_STAMPS[op]], ["viewer"], op);
  /* no pre-T33 op is in it: their stamps are the act lists' */
  for (const op of ["promote", "standarddeclare", "actionpressure", "docketpost"]) assert.ok(!Object.hasOwn(OP_STAMPS, op), op);
  /* negative control */
  assert.notDeepEqual([...OP_STAMPS.linerecord], ["viewer", "by"]);
});

test("R17: clockpropose any credential's, as actionlawspropose (admin, member, probe, mutating, no machineClasses), proposer and viewer stamped; clockadopt a member's (machineClasses []), contribute, author and viewer stamped; clocksics a read; addresseesuggest a read; exportrender a member's stamped viewer (K1640); officesseed and assistantset an administrator's own session, by stamped", () => {
  const ac = OP_FAMILIES["action-clocks"];
  assert.deepEqual(plain(OPS.clockpropose), plain(OPS.actionlawspropose));
  assert.ok(ac.proposals.includes("clockpropose") && ac.proposer.key === "proposer");
  assert.equal(NEEDS.clockpropose, "contribute");
  assert.deepEqual(plain(OPS.clockadopt), { classes: ["admin", "member"], machineClasses: [], mutating: true });
  assert.ok(ac.acts.includes("clockadopt") && ac.actor.key === "author");
  assert.equal(NEEDS.clockadopt, "contribute");
  for (const op of ["clocksics", "clocklateness", "addresseesuggest"]) {
    assert.equal(OPS[op].mutating, false, op);
    assert.equal(NEEDS[op], null, op);
  }
  assert.deepEqual(plain(OPS.exportrender), { classes: ["admin", "member"], machineClasses: [], mutating: true });
  assert.deepEqual(plain(OPS.exportpage), { classes: ["admin"], mutating: false });
  assert.deepEqual(plain(OPS.exportpage).classes, [...OPS.export.classes]);
  /* K1689: a present null row, affordances grading it; no session set holds it */
  assert.ok(Object.hasOwn(NEEDS, "exportpage") && NEEDS.exportpage === null && !SESSION_OPS.member.has("exportpage"));
  const is = OP_FAMILIES["instance-setup"];
  for (const op of ["officesseed", "assistantset"]) {
    assert.equal(is.kinds[op], "admin", op);
    assert.deepEqual(plain(OPS[op]), { classes: ["admin", "member"], machineClasses: [], mutating: true }, op);
  }
  assert.deepEqual(is.actor, { key: "by", at: "query" });
});

test("R18: entityidentify an act on the record, contribute, by stamped (the body's, as resolutiondefect's) and viewer; lines' acts as entityidentify; structureat, holderat, standardinforce, inforceat and standardsfor reads with a present null row", () => {
  assert.equal(OP_FAMILIES.entities.kinds.entityidentify, "open");
  assert.deepEqual(OP_FAMILIES.entities.actor, { key: "by", at: "body" });
  assert.equal(NEEDS.entityidentify, "contribute");
  for (const op of ["linerecord", "linewithdraw", "linecurrentthrough"]) {
    assert.deepEqual(plain(OPS[op]), plain(OPS.entityidentify), op);
    assert.equal(NEEDS[op], "contribute", op);
  }
  assert.deepEqual(OP_FAMILIES.lines.actor, OP_FAMILIES.entities.actor);
  for (const op of ["structureat", "holderat", "standardinforce", "inforceat", "standardsfor"]) {
    assert.equal(OPS[op].mutating, false, op);
    assert.ok(Object.hasOwn(NEEDS, op) && NEEDS[op] === null, op);
    assert.ok(OPS[op].classes.includes("member"), op);
  }
});

test("R20: ask a member's own session only (machineClasses []), viewer stamped; aiusage a session's read; the account-reference ops a member's own session only, by stamped from the query — no bearer, so no administrator token acts for another member — and no spec admits a group- or project-level credential", () => {
  assert.deepEqual(plain(OPS.ask), { classes: ["admin", "member"], machineClasses: [], mutating: true });
  assert.equal(OP_FAMILIES.answers.kinds.ask, "own");
  assert.deepEqual(OP_FAMILIES.answers.actor, { key: "viewer", at: "query" });
  assert.deepEqual(plain(OPS.aiusage), { classes: ["admin", "member"], machineClasses: [], mutating: false });
  const cr = OP_FAMILIES.credentials;
  for (const op of ["accountreferenceset", "accountreferenceremove", "accountswitchset", "aigrantmint"]) {
    assert.equal(cr.kinds[op], "own", op);
    assert.deepEqual([...OPS[op].machineClasses], [], op);
  }
  assert.deepEqual(cr.actor, { key: "by", at: "query" });
  /* no op names a group- or project-level account */
  for (const op of Object.keys(OPS)) assert.doesNotMatch(op, /^(group|project|instance)(account|claude|reference)/, op);
  /* the agent's grant is admitted by its scope alone: no spec names ai */
  for (const op of [...FAMILY_OPS, ...ASK_GRANT_OPS]) assert.ok(!JSON.stringify(OPS[op]).includes('"ai"'), op);
});

test("R19, R3 (K1601, K1566): the ask's three plane ops admit a session's kinds and no bearer, are in no session set, askusage alone mutating and unattended by a cited decision; moneydetectorsrun the operator's (admin, probe), in no session set, unattended by money-checks R6", () => {
  assert.deepEqual([...ASK_GRANT_OPS], ["askceiling", "askcheck", "askusage"]);
  for (const op of ASK_GRANT_OPS) {
    assert.deepEqual(plain(OPS[op]), { classes: ["admin", "member"], machineClasses: [], mutating: op === "askusage" }, op);
    assert.ok(!SESSION_OPS.member.has(op) && !SESSION_OPS.admin.has(op), op);
    assert.ok(!Object.hasOwn(NEEDS, op), op);
  }
  assert.match(UNATTENDED_BY_DECISION.askusage, /K1601/);
  assert.deepEqual(plain(OPS.moneydetectorsrun), { classes: ["admin", "probe"], mutating: true });
  assert.ok(!SESSION_OPS.member.has("moneydetectorsrun") && !SESSION_OPS.admin.has("moneydetectorsrun"));
  assert.ok(Object.hasOwn(NEEDS, "moneydetectorsrun") && NEEDS.moneydetectorsrun === null, "K1689");
  assert.match(UNATTENDED_BY_DECISION.moneydetectorsrun, /money-checks\.md R6/);
  assert.ok(servedBy("money-checks").includes("moneydetectorsrun"));
});
