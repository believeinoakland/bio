/* op-declarations, T49 (R71, R72; N1072, N1091; K3265, K3333; DEC-237 (3)): the founder's handle op and the project
   owners' votes read, with R34 over each. Each op is tested by name with its controls (K874). Specs, sets, rows and
   stamps are read from the exported tables; each stamp is driven through its owner's own ops map (membership's,
   project-roster's), so a stamp named at a site the owner does not read is seen. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as O from "../../../src/op-declarations/index.mjs";
import { T49_SHARES } from "../../../src/op-declarations/t49.mjs";
import * as AFF from "../../../src/affordances.mjs";
import { AI_GRANT_OPS } from "../../../src/credentials/index.mjs";
import { membershipOps } from "../../../src/membership/index.mjs";
import { projectRosterOps } from "../../../src/project-roster/index.mjs";

const { OPS, SESSION_OPS, NEEDS, OP_STAMPS, OP_FAMILIES, OP_KINDS, OP_ALIASES, GOVERNANCE_ACTIONS, IDENTITY_ACTIONS,
        UNATTENDED_BY_DECISION, ACT_GATE, ACT_HELP_ABSENT } = O;
const SESSION = ["admin", "member"];
const plain = (s) => JSON.parse(JSON.stringify(s));
const stamps = (op) => (Object.hasOwn(OP_STAMPS, op) ? [...OP_STAMPS[op]].sort() : null);
const familyOf = (op) => Object.values(OP_FAMILIES).filter((f) => Object.hasOwn(f.kinds, op)).map((f) => f.owner);
const LISTS = Object.entries(O).filter(([, v]) => Array.isArray(v));
const listsOf = (op) => LISTS.filter(([, l]) => l.includes(op)).map(([n]) => n)
  .filter((n) => !["FAMILY_OPS", "FAMILY_SESSION_OPS"].includes(n)).sort();
const ground = (op) => Object.entries(ACT_HELP_ABSENT).filter(([, g]) => g.ops.includes(op)).map(([k]) => k);
const explained = (op) => Object.hasOwn(AFF.ACT_HELP, op) && typeof AFF.ACT_HELP[op] === "string" && AFF.ACT_HELP[op].length > 0;
/* a caller not arriving by a session is judged against machineClasses where given (admission R5) */
const machineAdmits = (op) => ["admin", "member", "probe", "daemon", "ai"].filter((c) => (OPS[op].machineClasses ?? OPS[op].classes ?? []).includes(c));

/* An owner's map over a service that records each call and its arguments. */
const drive = async (mapFn, op, { query = {}, body = {} } = {}) => {
  const url = new URL("http://plane/");
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const calls = [];
  const svc = new Proxy({}, { get: (_, k) => (k === "then" ? undefined : (...args) => { calls.push([k, args]); return { ok: true }; }) });
  try { await mapFn(svc, url, body, svc, svc)[op](); } catch { /* recorded already */ }
  return JSON.stringify(calls);
};
const keysOf = (mapFn) => {
  const svc = new Proxy({}, { get: (_, k) => (k === "then" ? undefined : () => ({ ok: true })) });
  return Object.keys(mapFn(svc, new URL("http://plane/"), {}, svc, svc));
};
const SENT = "member:sentinel-49";
const reaches = async (mapFn, op, where) => (await drive(mapFn, op, where)).includes(SENT);

/* what an op of the shared conditions is: in neither bearer fence, off AI_GRANT_OPS, no `ai` class, never unattended,
   no alias, in no other list, frozen, a present `null` row */
const shared = (op) => {
  assert.ok(Object.hasOwn(OPS, op), `${op}: no spec`);
  assert.ok(Object.isFrozen(OPS[op]) && Object.isFrozen(OPS[op].classes), op);
  assert.ok(Object.hasOwn(NEEDS, op) && NEEDS[op] === null, `${op}: a present null NEEDS row`);
  assert.equal(ACT_GATE.needs(op), null, op);
  assert.ok(!GOVERNANCE_ACTIONS.includes(op) && !IDENTITY_ACTIONS.includes(op), `${op}: in a bearer fence`);
  assert.ok(!AI_GRANT_OPS.includes(op), `${op}: on AI_GRANT_OPS`);
  assert.ok(!JSON.stringify(OPS[op]).includes('"ai"'), `${op}: names ai`);
  assert.ok(!Object.hasOwn(UNATTENDED_BY_DECISION, op), op);
  assert.ok(!Object.hasOwn(OP_ALIASES, op) && !Object.values(OP_ALIASES).includes(op), `${op}: aliased`);
  assert.deepEqual(listsOf(op), [], `${op} is in ${listsOf(op)}`);
  assert.deepEqual(machineAdmits(op), [], `${op}: a bearer reaches it`);
};

/* ---------- R71 ---------- */

test("R71 (T49; N1072; K3265; membership R144): founderhandleset, in membership's family, is in SESSION_OPS.admin only (the founder's session) with classes admin, machineClasses [], mutating, a present null NEEDS row and by and viewer stamped; in neither GOVERNANCE_ACTIONS nor IDENTITY_ACTIONS and not on credentials' AI_GRANT_OPS (negative control: an enrolled member's set, an ai credential and a binding token do not reach it)", async () => {
  const op = "founderhandleset";
  shared(op);
  assert.deepEqual(familyOf(op), ["membership"]);
  assert.equal(OP_FAMILIES.membership.kinds[op], "founder");
  assert.deepEqual(plain(OPS[op]), { classes: ["admin"], machineClasses: [], mutating: true });
  assert.deepEqual(stamps(op), ["by", "viewer"]);
  assert.ok(OP_FAMILIES.membership.acts.includes(op), "an act of the family, so `by` is stamped");
  /* the founder's set alone */
  assert.ok(SESSION_OPS.admin.has(op), "not in the founder's set");
  assert.ok(!SESSION_OPS.member.has(op), "in the member set");
  assert.equal(ACT_GATE.mode(op), "admin-session");
  assert.ok(!O.FAMILY_SESSION_OPS.includes(op), "FAMILY_SESSION_OPS holds the ops of both sets");
  assert.ok(O.FAMILY_OPS.includes(op));
  /* membership's map reads `by` from the query and `handle` from the body, and routes the op */
  assert.ok(keysOf(membershipOps).includes(op));
  assert.ok(await reaches(membershipOps, op, { query: { by: SENT } }), "by is the query's");
  assert.ok(await reaches(membershipOps, op, { body: { handle: SENT } }), "handle is the body's");
  /* controls */
  assert.ok(!(await reaches(membershipOps, op, { body: { by: SENT } })), "a body `by` reached the owner");
  assert.ok(!(await reaches(membershipOps, op, { query: { handle: SENT } })), "a query `handle` reached the owner");
  assert.equal(OPS[op].classes.includes("member"), false, "a member session is admitted by class");
  assert.equal(OPS[op].classes.includes("ai"), false, "an ai credential is admitted");
  assert.deepEqual(machineAdmits(op), [], "a binding token or an ai credential is admitted");
  assert.deepEqual(OPS[op].machineClasses, []);
  /* every other family op of a session kind is in both sets: this is the one the founder's set holds alone among the
     families' ops */
  for (const [o, k] of Object.entries(OP_KINDS)) if (k.founderOnly) assert.equal(o, "founder", "only the founder kind is founder-only");
  const founderOnlyOps = O.FAMILY_OPS.filter((o) => SESSION_OPS.admin.has(o) && !SESSION_OPS.member.has(o));
  assert.deepEqual(founderOnlyOps, [op]);
});

test("R71 (T49): claim's spec is unchanged — public, mutating, stamped source and country only, in no session set — and the T49 share names no body field for it (the door passes `handle`, control-plane R97)", () => {
  assert.deepEqual(plain(OPS.claim), { classes: null, mutating: true });
  assert.deepEqual(stamps("claim"), ["country", "source"]);
  assert.ok(!SESSION_OPS.member.has("claim") && !SESSION_OPS.admin.has("claim"));
  assert.ok(!Object.hasOwn(NEEDS, "claim") || NEEDS.claim === null);
  /* negative control: the T49 shares declare no op beside the two */
  assert.deepEqual(Object.values(T49_SHARES).flatMap((s) => Object.keys(s.ops)).sort(), ["founderhandleset", "projectownervotes"]);
  assert.ok(Object.isFrozen(T49_SHARES) && Object.values(T49_SHARES).every((s) => Object.isFrozen(s) && Object.isFrozen(s.ops)));
});

test("R71, R34 (T49; affordances R61): founderhandleset is explained by affordances' ACT_HELP under its own name, or else named under one ground of ACT_HELP_ABSENT until it is — never both (negative control: an explained op is named under no ground)", () => {
  const op = "founderhandleset";
  assert.equal(ground(op).length + (explained(op) ? 1 : 0), 1, `${op}: explained and named, or neither`);
  if (!explained(op)) assert.deepEqual(ground(op), ["unexplained"]);
  assert.ok(explained("statementack") && ground("statementack").length === 0);
});

/* ---------- R72 ---------- */

test("R72 (T49; N1091; DEC-237 (3); project-roster R30): projectownervotes, in project-roster's family, is a read for a member's session only — classes admin and member, machineClasses [], not mutating, viewer stamped, a present null NEEDS row, in both session sets, in neither GOVERNANCE_ACTIONS nor IDENTITY_ACTIONS and not on AI_GRANT_OPS (negative control: an ai credential, a binding token and a probe are not admitted; a viewer the caller sends is not the one stamped)", async () => {
  const op = "projectownervotes";
  shared(op);
  assert.deepEqual(familyOf(op), ["project-roster"]);
  assert.equal(OP_FAMILIES["project-roster"].kinds[op], "ownread");
  assert.deepEqual(plain(OPS[op]), { classes: SESSION, machineClasses: [], mutating: false });
  assert.deepEqual(stamps(op), ["viewer"]);
  assert.ok(OP_FAMILIES["project-roster"].reads.includes(op));
  assert.ok(SESSION_OPS.member.has(op) && SESSION_OPS.admin.has(op));
  assert.equal(ACT_GATE.mode(op), "session");
  assert.ok(O.FAMILY_SESSION_OPS.includes(op));
  /* project-roster's map routes it: the project is the query's and the viewer is read from the query (the door's stamp) */
  assert.ok(keysOf(projectRosterOps).includes(op));
  assert.ok(await reaches(projectRosterOps, op, { query: { projectId: SENT } }), "projectId is the query's");
  assert.ok(await reaches(projectRosterOps, op, { query: { viewer: SENT } }), "viewer is the query's, the door's stamp");
  /* controls */
  assert.ok(!(await reaches(projectRosterOps, op, { body: { viewer: SENT } })), "a body viewer reached the owner");
  assert.ok(!(await reaches(projectRosterOps, op, { body: { projectId: SENT } })), "a body project reached the owner");
  for (const cls of ["ai", "probe", "daemon"]) assert.equal(OPS[op].classes.includes(cls), false, `${cls} is admitted by class`);
  assert.deepEqual(machineAdmits(op), [], "a binding token or an ai credential is admitted");
  assert.equal(OPS[op].mutating, false);
});

test("R72, R34 (T49): projectownervotes is named in ACT_HELP_ABSENT under the read ground (a read a screen draws from) while affordances' ACT_HELP holds no text for it, and under none once it does — never both (negative control: an explained op is named under no ground)", () => {
  const op = "projectownervotes";
  assert.equal(ground(op).length + (explained(op) ? 1 : 0), 1, `${op}: explained and named, or neither`);
  if (!explained(op)) assert.deepEqual(ground(op), ["read"]);
  assert.ok(SESSION_OPS.member.has(op));
  assert.ok(explained("statementack") && ground("statementack").length === 0);
});
