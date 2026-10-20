/* op-declarations, the fix round of T51 (R80, R81; K4165, K4168): an op's declaration taken from its owner's
   `DECLARED_OPS` beside the hand rows, its fields kept, and the refusals. Every test loads a fresh, independent instance
   of the module (a query on the specifier) because the registration is once per instance and before its first read;
   the owners' rows are fixtures (no real module), except that the hand row an agreement is judged against is
   `heldat`'s, a real op. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as O from "../../../src/op-declarations/index.mjs";

let n = 0;
const fresh = () => import(`../../../src/op-declarations/index.mjs?declared=${++n}`);
const MP = ["admin", "member", "probe"];
const FIELDS = { accepts: ["q", "limit"], requires: ["q", ["id", "handle"]] };
const READ = { classes: MP, mutating: false, weight: "read", description: "fixture.read", fields: FIELDS };
const NEW = {
  fixtureread: { ...READ },
  fixtureact: { classes: ["admin", "member"], machineClasses: [], mutating: true, needs: "contribute", stamps: ["by", "viewer"],
    weight: "act", description: "fixture.act", fields: { accepts: ["note"], requires: [] } },
  fixturepublic: { classes: null, mutating: false, weight: "read", description: "fixture.public", fields: { accepts: ["id"], requires: ["id"] } },
  fixturebare: { classes: MP, mutating: false, weight: "read", description: "fixture.bare" },
};
/* heldat's hand row (R77): a read, classes admin/member/probe, machineClasses admin/probe, stamps viewer and by, a null row */
const HELDAT = { classes: MP, machineClasses: ["admin", "probe"], mutating: false, stamps: ["viewer", "by"], needs: null,
  weight: "read", description: "fixture.heldat", fields: { accepts: ["address", "sha256", "check"], requires: [["address", "sha256"]] } };
const view = (m) => JSON.stringify({ ops: m.OPS, needs: m.NEEDS, stamps: m.OP_STAMPS, member: [...m.SESSION_OPS.member],
  admin: [...m.SESSION_OPS.admin], families: m.OP_FAMILIES, lists: Object.entries(m).filter(([, v]) => Array.isArray(v)) });
const without = (m, ops) => {
  const strip = (t) => Object.fromEntries(Object.entries(t).filter(([k]) => !ops.includes(k)));
  return JSON.stringify({ ops: strip(m.OPS), needs: strip(m.NEEDS), stamps: strip(m.OP_STAMPS),
    member: [...m.SESSION_OPS.member].filter((o) => !ops.includes(o)), admin: [...m.SESSION_OPS.admin].filter((o) => !ops.includes(o)),
    families: m.OP_FAMILIES, lists: Object.entries(m).filter(([, v]) => Array.isArray(v)) });
};

test("R80: an op with an owner row only is declared: in OPS, its stamps, its NEEDS row and both session sets, and its fields are read back", async () => {
  const m = await fresh();
  m.registerDeclaredOps({ owner1: NEW });
  assert.deepEqual({ ...m.OPS.fixtureread }, { classes: MP, mutating: false });
  assert.deepEqual({ ...m.OPS.fixtureact }, { classes: ["admin", "member"], machineClasses: [], mutating: true });
  assert.deepEqual([...m.OP_STAMPS.fixtureread], ["viewer"]);
  assert.deepEqual([...m.OP_STAMPS.fixtureact], ["by", "viewer"]);
  assert.equal(m.NEEDS.fixtureread, null);
  assert.equal(Object.hasOwn(m.NEEDS, "fixtureread"), true);
  assert.equal(m.NEEDS.fixtureact, "contribute");
  for (const op of ["fixtureread", "fixtureact", "fixturebare"]) {
    assert.equal(m.SESSION_OPS.member.has(op), true, op);
    assert.equal(m.SESSION_OPS.admin.has(op), true, op);
    assert.equal(m.ACT_GATE.mode(op), "session", op);
  }
  assert.equal(m.ACT_GATE.needs("fixtureact"), "contribute");
  assert.deepEqual(m.declaredFields("fixtureread"), FIELDS);
  assert.deepEqual(m.declaredFields("fixtureact"), { accepts: ["note"], requires: [] });
});

test("R80: a public owner row is declared with no credential, no stamp, no NEEDS row and no session set", async () => {
  const m = await fresh();
  m.registerDeclaredOps([["owner1", NEW]]);
  assert.deepEqual({ ...m.OPS.fixturepublic }, { classes: null, mutating: false });
  assert.deepEqual([...m.OP_STAMPS.fixturepublic], []);
  assert.equal(Object.hasOwn(m.NEEDS, "fixturepublic"), false);
  assert.equal(m.SESSION_OPS.member.has("fixturepublic"), false);
  assert.equal(m.SESSION_OPS.admin.has("fixturepublic"), false);
  assert.equal(m.ACT_GATE.mode("fixturepublic"), "machine");
  /* control: the same op as a non-public row is in the sets */
  const o = await fresh();
  o.registerDeclaredOps({ owner1: { fixturepublic: { ...NEW.fixturepublic, classes: MP } } });
  assert.equal(o.SESSION_OPS.member.has("fixturepublic"), true);
});

test("R80: an op with no fields answers undefined, as does an op nobody declared; the fields are frozen copies of the owner's", async () => {
  const m = await fresh();
  const rows = structuredClone(NEW);
  m.registerDeclaredOps({ owner1: rows });
  assert.equal(m.declaredFields("fixturebare"), undefined);
  assert.equal(m.declaredFields("nosuchop"), undefined);
  assert.equal(m.declaredFields("promote"), undefined);
  const f = m.declaredFields("fixtureread");
  assert.ok(Object.isFrozen(f) && Object.isFrozen(f.accepts) && Object.isFrozen(f.requires) && Object.isFrozen(f.requires[1]));
  rows.fixtureread.fields.accepts.push("late");
  assert.deepEqual(m.declaredFields("fixtureread").accepts, ["q", "limit"]);
  assert.throws(() => { f.accepts.push("x"); }, TypeError);
});

test("R80: the declared tables stay frozen to their leaves (R5)", async () => {
  const m = await fresh();
  m.registerDeclaredOps({ owner1: NEW });
  assert.ok(Object.isFrozen(m.OPS) && Object.isFrozen(m.OPS.fixtureact) && Object.isFrozen(m.OPS.fixtureact.classes));
  assert.ok(Object.isFrozen(m.OPS.fixtureact.machineClasses) && Object.isFrozen(m.OP_STAMPS.fixtureact));
  assert.throws(() => { m.OPS.fixtureact.mutating = false; }, TypeError);
  assert.throws(() => m.SESSION_OPS.member.add("fixtureact2"), TypeError);
  assert.throws(() => { m.NEEDS.fixtureact = null; }, TypeError);
});

test("R80: registering only new ops changes nothing else, and with no registration every export is as it was (control)", async () => {
  const plain = await fresh();
  const registered = await fresh();
  const none = await fresh();
  registered.registerDeclaredOps({ owner1: NEW });
  none.registerDeclaredOps({});
  assert.equal(view(plain), view(O));
  assert.equal(view(none), view(O));
  assert.equal(without(registered, Object.keys(NEW)), without(plain, Object.keys(NEW)));
  assert.notEqual(view(registered), view(plain));
  assert.equal(plain.declaredFields("heldat"), undefined);
  for (const op of Object.keys(NEW)) assert.equal(Object.hasOwn(plain.OPS, op), false, op);
});

test("R80: a registration builds no table (R69): nothing is read until the first read, and a registered instance builds once", async () => {
  const m = await fresh();
  m.registerDeclaredOps({ owner1: NEW });
  assert.equal(typeof m.registerDeclaredOps, "function");
  assert.equal(typeof m.declaredFields, "function");
  const a = m.OPS;
  assert.equal(Object.hasOwn(m.OPS, "fixtureread"), true);
  assert.equal(a, m.OPS);
});

test("R80: a malformed row is refused naming the op, and nothing is registered", async () => {
  const bad = {
    classnull: { classes: "member", mutating: false },
    classunknown: { classes: ["admin", "root"], mutating: false },
    machine: { classes: MP, machineClasses: "admin", mutating: false },
    machineunknown: { classes: MP, machineClasses: ["ai"], mutating: false },
    mutating: { classes: MP, mutating: "yes" },
    needsmissing: { classes: MP, mutating: true },
    needsshape: { classes: MP, mutating: false, needs: 3 },
    stampunknown: { classes: MP, mutating: false, stamps: ["viewer", "nosuchstamp"] },
    stampshape: { classes: MP, mutating: false, stamps: "viewer" },
    fieldsshape: { classes: MP, mutating: false, fields: ["q"] },
    acceptsshape: { classes: MP, mutating: false, fields: { accepts: "q", requires: [] } },
    requiresshape: { classes: MP, mutating: false, fields: { accepts: ["q"], requires: [3] } },
    requiresalt: { classes: MP, mutating: false, fields: { accepts: ["q"], requires: [["q", 3]] } },
    row: null,
  };
  for (const [op, row] of Object.entries(bad)) {
    const m = await fresh();
    assert.throws(() => m.registerDeclaredOps({ owner1: { [op]: row } }), (e) => e instanceof TypeError && e.message.includes(op), op);
    assert.equal(Object.hasOwn(m.OPS, op), false, op);
    assert.equal(m.declaredFields(op), undefined, op);
  }
  /* control: the same rows made well are accepted */
  const m = await fresh();
  m.registerDeclaredOps({ owner1: { classnull: { classes: null, mutating: false }, machine: { classes: MP, machineClasses: [], mutating: false },
    needsok: { classes: MP, mutating: true, needs: "publish" } } });
  assert.equal(Object.hasOwn(m.OPS, "classnull"), true);
  assert.equal(m.NEEDS.needsok, "publish");
});

test("R81: an owner row that agrees with the hand row of heldat is accepted and its fields are kept; the tables are unchanged (control)", async () => {
  const m = await fresh();
  m.registerDeclaredOps({ capture: { heldat: HELDAT } });
  assert.equal(view(m), view(O));
  assert.deepEqual(m.declaredFields("heldat"), HELDAT.fields);
  /* a row that leaves stamps and needs out is judged on the class lists and mutating alone */
  const o = await fresh();
  const { stamps, needs, ...bare } = HELDAT;
  o.registerDeclaredOps({ capture: { heldat: { ...bare, classes: [...MP].reverse() } } });
  assert.equal(view(o), view(O));
});

test("R81: an owner row that disagrees with the hand row of heldat on classes, machineClasses, mutating, stamps or needs is refused naming heldat and the field", async () => {
  const cases = {
    classes: { classes: ["admin", "member"] },
    classesNull: { classes: null },
    machineClasses: { machineClasses: ["admin"] },
    machineAbsent: { machineClasses: undefined },
    machineEmpty: { machineClasses: [] },
    mutating: { mutating: true },
    stamps: { stamps: ["viewer"] },
    stampsExtra: { stamps: ["viewer", "by", "author"] },
    needs: { needs: "contribute" },
  };
  for (const [what, change] of Object.entries(cases)) {
    const m = await fresh();
    const row = { ...HELDAT, ...change };
    if (what === "machineAbsent") delete row.machineClasses;
    const field = what.replace(/Null|Absent|Empty|Extra$/, "");
    assert.throws(() => m.registerDeclaredOps({ capture: { heldat: row, fixtureread: NEW.fixtureread } }),
      (e) => e instanceof TypeError && e.message.includes("heldat") && e.message.includes(field), what);
    /* nothing registered: the module is as it was, the op beside it too */
    assert.equal(view(m), view(O), what);
    assert.equal(m.declaredFields("heldat"), undefined, what);
    assert.equal(Object.hasOwn(m.OPS, "fixtureread"), false, what);
  }
});

test("R81: an owner row for an alias or a family op of the hand tables is judged against the hand row the same way", async () => {
  const m = await fresh();
  m.registerDeclaredOps({ following: { followbody: { classes: ["admin", "member"], machineClasses: [], mutating: true, needs: "contribute" } } });
  const o = await fresh();
  assert.throws(() => o.registerDeclaredOps({ following: { followbody: { classes: ["admin", "member"], machineClasses: [], mutating: false } } }),
    (e) => e.message.includes("followbody"));
  const a = await fresh();
  assert.throws(() => a.registerDeclaredOps({ money: { recordfact: { classes: MP, mutating: false } } }), (e) => e.message.includes("recordfact"));
});

test("R81: an op in two owner rows is refused naming the op and both owners", async () => {
  const m = await fresh();
  assert.throws(() => m.registerDeclaredOps({ one: { fixtureread: NEW.fixtureread }, two: { fixtureread: NEW.fixtureread, other: NEW.fixturebare } }),
    (e) => e instanceof TypeError && e.message.includes("fixtureread") && e.message.includes("one") && e.message.includes("two"));
  assert.throws(() => m.registerDeclaredOps([["one", { heldat: HELDAT }], ["two", { heldat: HELDAT }]]), (e) => e.message.includes("heldat"));
  /* control: two owners with different ops are accepted, after the refusals */
  m.registerDeclaredOps([["one", { fixtureread: NEW.fixtureread }], ["two", { fixturebare: NEW.fixturebare }]]);
  assert.equal(Object.hasOwn(m.OPS, "fixturebare"), true);
  assert.equal(Object.hasOwn(m.OPS, "other"), false);
});

test("R81: a registration after the first read throws naming the op and changes nothing; a second registration is refused; a refused one leaves a later valid one possible", async () => {
  const m = await fresh();
  const before = view(await fresh());
  assert.equal(Object.hasOwn(m.OPS, "promote"), true);
  assert.throws(() => m.registerDeclaredOps({ owner1: NEW }), (e) => e instanceof TypeError && e.message.includes("fixtureread"));
  assert.equal(Object.hasOwn(m.OPS, "fixtureread"), false);
  assert.equal(m.declaredFields("fixtureread"), undefined);
  assert.equal(view(m), before);

  const twice = await fresh();
  twice.registerDeclaredOps({ owner1: { fixtureread: NEW.fixtureread } });
  assert.throws(() => twice.registerDeclaredOps({ owner2: { fixturebare: NEW.fixturebare } }), (e) => e.message.includes("fixturebare"));
  assert.equal(Object.hasOwn(twice.OPS, "fixturebare"), false);
  assert.equal(Object.hasOwn(twice.OPS, "fixtureread"), true);

  const refused = await fresh();
  assert.throws(() => refused.registerDeclaredOps({ capture: { heldat: { ...HELDAT, mutating: true } } }), (e) => e.message.includes("heldat"));
  refused.registerDeclaredOps({ owner1: { fixtureread: NEW.fixtureread } });
  assert.equal(Object.hasOwn(refused.OPS, "fixtureread"), true);
});
