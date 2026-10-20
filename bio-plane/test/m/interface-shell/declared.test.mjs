/* interface-shell R104 (T51 fix round; K4164 goal 3, K4168): the harness through which every screen test routes its requests
   compares each op request's field names with the `fields` its owner declares for that op, throws `FieldMismatch` for a field
   the op does not accept or a required one missing (the shell shows "no answer" and the test that pressed the act fails), lets an
   op with no declaration through and counts it, and prints `declared N of M ops` over every act of the nine screen modules. */
import "./register.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { boot, FieldMismatch, fieldMismatches, collectOwnerRows, collectedDuplicates, undeclaredOps } from "./harness.mjs";
import { browserActs } from "../../../src/interface-shell/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";

/* a stand-in screen on a real registry id whose one act, `promote` (it runs on press), sends the body its button carries */
const SENDER = {
  id: "home", words: [],
  reads() { return {}; },
  render(cs) {
    return "<h1>x</h1>" + cs.act("promote", { label: "act.promote.label.home", data: { which: "good", body: JSON.stringify({ title: "A", note: "n" }) } })
      + cs.act("promote", { label: "act.promote.label.home", data: { which: "unknown", body: JSON.stringify({ title: "A", colour: "red" }) } })
      + cs.act("promote", { label: "act.promote.label.home", data: { which: "missing", body: JSON.stringify({ note: "n" }) } })
      + cs.act("promote", { label: "act.promote.label.home", data: { which: "alt", body: JSON.stringify({ title: "A", id: "1" }) } });
  },
  acts: [{ op: "promote", send(view, el) { return { body: JSON.parse(el.dataset.body) }; } }],
};
/* the owner's fixture row: `title` required, `note` and `id` accepted; one required entry is a list of alternatives */
const ROW = { classes: ["member"], mutating: true, weight: "reversible", description: "x", fields: { accepts: ["title", "note", "id"], requires: [["title", "name"]] } };
const press = (page, which) => page.click(page.root().querySelector(`[data-act="promote"][data-which="${which}"]`));

test("R104 a request whose fields match the owner's declaration passes (control), and a field the op does not accept fails the test that pressed the act, naming the op and the field", async () => {
  const page = await boot({ screens: [SENDER], path: "/app", declared: { promote: ROW } });
  const before = page.byOp("promote").length;
  await press(page, "good");
  assert.equal(page.byOp("promote").length, before + 1, "the correct request is sent");
  await assert.rejects(() => press(page, "unknown"), (e) => {
    assert.ok(e instanceof FieldMismatch, "a FieldMismatch");
    assert.equal(e.op, "promote");
    assert.deepEqual(e.mismatches, [{ kind: "unknown", field: "colour" }]);
    assert.match(e.message, /promote/);
    assert.match(e.message, /colour/);
    return true;
  });
  /* the shell saw no answer: the guard stopped the request in the page's fetch, as a lost connection would */
  assert.equal(page.root().querySelector('[data-act="promote"][data-which="unknown"]').getAttribute("aria-busy"), null, "the button is usable again");
});

test("R104 a required field missing fails the test that pressed the act, naming the field; a list entry is satisfied by any one alternative", async () => {
  const page = await boot({ screens: [SENDER], path: "/app", declared: { promote: ROW } });
  await assert.rejects(() => press(page, "missing"), (e) => {
    assert.ok(e instanceof FieldMismatch);
    assert.deepEqual(e.mismatches, [{ kind: "missing", field: "title or name" }]);
    return true;
  });
  /* `name` stands for `title`: the alternative satisfies the entry */
  assert.deepEqual(fieldMismatches({ query: { op: "promote" }, body: { name: "A" } }, { fields: { accepts: ["title", "name"], requires: [["title", "name"]] } }), []);
  assert.deepEqual(fieldMismatches({ query: { op: "promote" }, body: { title: "A" } }, { fields: { accepts: ["title", "name"], requires: [["title", "name"]] } }), []);
  /* control: the same entry with neither alternative present is one missing */
  assert.deepEqual(fieldMismatches({ query: { op: "promote" }, body: {} }, { fields: { accepts: ["title", "name"], requires: [["title", "name"]] } }), [{ kind: "missing", field: "title or name" }]);
});

test("R104 the shell's own marks are no fields; a query field counts, and so does a required one carried in the query", () => {
  const row = { fields: { accepts: ["limit", "project"], requires: ["project"] } };
  assert.deepEqual(fieldMismatches({ query: { op: "queue", background: "1", project: "P", limit: "5" }, body: undefined }, row), [], "op and background are no fields");
  assert.deepEqual(fieldMismatches({ query: { op: "queue", project: "P", extra: "1" }, body: undefined }, row), [{ kind: "unknown", field: "extra" }]);
  assert.deepEqual(fieldMismatches({ query: { op: "queue" }, body: "raw bytes" }, row), [{ kind: "missing", field: "project" }], "a raw body carries no named fields");
  assert.deepEqual(fieldMismatches({ query: { op: "queue", project: "P" }, body: "raw bytes" }, row), [], "a raw body is let through; the query's fields are checked");
});

test("R104 an op with no owner declaration is let through and counted; control: a declared op is not counted", async () => {
  const page = await boot({ screens: [SENDER], path: "/app", declared: {} });
  const before = undeclaredOps().get("promote") || 0;
  await press(page, "unknown");
  assert.equal(page.byOp("promote").length, 1, "the request is sent");
  assert.equal((undeclaredOps().get("promote") || 0) - before, 1, "and counted");
  const page2 = await boot({ screens: [SENDER], path: "/app", declared: { promote: ROW } });
  const mid = undeclaredOps().get("promote") || 0;
  await press(page2, "good");
  assert.equal(undeclaredOps().get("promote") || 0, mid, "a declared op is not counted");
  assert.ok(Object.hasOwn({ ...ROW }, "fields"));
});

/* the nine screen modules, imported by name as `t50.test.mjs` does (R73, R87): they follow this module in the order, so the import is made at run time */
const MODS = ["screens-entry", "screens-wizards", "screens-settings", "screens-intake", "screens-daily", "screens-inquiry", "screens-investigate", "screens-publish", "screens-action"];

test("R104 declared N of M ops: every act of every screen module's SCREENS is enumerated and counted against the owners' declarations (the metric the census prints before each release)", async () => {
  const modules = {};
  for (const m of MODS) modules[m] = (await import(`../../../src/${m}/index.mjs`)).SCREENS;
  const rows = collectOwnerRows();
  const ops = new Map();
  for (const [m, list] of Object.entries(modules)) {
    assert.ok(Array.isArray(list) && list.length > 0, `${m} registers screens`);
    for (const s of list) for (const a of s.acts) if (typeof a.op === "string" && !Object.hasOwn(browserActs(), a.op)) { if (!ops.has(a.op)) ops.set(a.op, []); ops.get(a.op).push(`${m}/${s.id}`); }
  }
  const declaredOps = [...ops.keys()].filter((op) => rows[op] && rows[op].fields);
  console.log(`declared ${declaredOps.length} of ${ops.size} ops`);
  assert.ok(ops.size > 0, "the screens name ops");
  assert.ok(declaredOps.length <= ops.size);
  assert.equal(declaredOps.length + [...ops.keys()].filter((op) => !declaredOps.includes(op)).length, ops.size, "every op is declared or counted undeclared");
  /* a fixture row makes an op declared: control that the count moves with the rows */
  const some = [...ops.keys()][0];
  const withRow = [...ops.keys()].filter((op) => op === some || (rows[op] && rows[op].fields));
  assert.equal(withRow.length, declaredOps.length + (declaredOps.includes(some) ? 0 : 1));
});

test("R104 the owners' rows are the collector's, and an op it lists as declared by two modules fails", () => {
  assert.deepEqual(collectedDuplicates(), [], "no op is declared by two owners");
  assert.equal(typeof collectOwnerRows(), "object");
});

test("R104 B18 the reason the shell adds to a Reasoned act is a shell mark, not a field the guard checks: an owner declaring no reason passes; control: any other undeclared field still fails, and a declared reason is checked as a field", async () => {
  const row = { fields: { accepts: ["title"], requires: [] } };
  assert.deepEqual(fieldMismatches({ query: { op: "memberadd" }, body: { title: "A", reason: "because" } }, row), []);
  assert.deepEqual(fieldMismatches({ query: { op: "memberadd" }, body: { title: "A", reason: "r", colour: "red" } }, row), [{ kind: "unknown", field: "colour" }]);
  assert.deepEqual(fieldMismatches({ query: { op: "memberadd" }, body: { title: "A" } }, { fields: { accepts: ["title"], requires: ["reason"] } }), [{ kind: "missing", field: "reason" }], "an owner that requires reason still has it checked");
  /* through the page: a Reasoned act's reason box adds `reason`, and an owner declaring none passes */
  const act = { id: "members", words: [], reads: () => ({}), acts: [{ op: "memberadd", send: () => ({ body: { title: "A" } }) }], render: (cs) => cs.act("memberadd", { label: "act.memberadd.label.members" }) };
  const who = { tokenClass: "member", session: true, member: "rosa", handle: "rosa", administer: true, rootOfTrust: false, capabilities: ["contribute", "administer"], vocabulary: [], confinedTo: null };
  const page = await boot({ screens: [act], path: "/app/members", plane: { whoami: { status: 200, json: { ok: true, result: who } } }, declared: { memberadd: row } });
  await page.click(page.root().querySelector('button[data-act="memberadd"]'));
  page.root().querySelector(".mk-slot textarea").value = "because";
  await page.click(page.root().querySelector('[data-shell="reason-send"]'));
  assert.equal(page.byOp("memberadd").length, 1);
  assert.equal(page.byOp("memberadd")[0].body.reason, "because");
});

test("R104 B19 control: against the owners' real declarations a stand-in sending an undeclared field still fails the guard, and one sending what the owner declares passes", async () => {
  const bad = { id: "doorbell", words: [], reads: () => ({}), acts: [{ op: "knock", send: () => ({ body: { text: "a memo" } }) }], render: (cs) => cs.act("knock") };
  const good = { ...bad, acts: [{ op: "knock", send: () => ({ body: { content: "a memo" } }) }] };
  const a = await boot({ screens: [bad], path: "/app/doorbell", session: null });
  await assert.rejects(() => a.click('button[data-act="knock"]'), (e) => e instanceof FieldMismatch && e.op === "knock" && e.mismatches.some((m) => m.kind === "unknown" && m.field === "text"));
  const b = await boot({ screens: [good], path: "/app/doorbell", session: null });
  await b.click('button[data-act="knock"]');
  assert.equal(b.byOp("knock").length, 1);
});

test("R104 the harness registers every owner's declarations through test-support's registerDeclared (K4245), so the real SCREENS compose over the tables as the plane builds them: every op an owner declares is in OPS; control: an op nobody declares is not", () => {
  const rows = collectOwnerRows();
  const declared = Object.keys(rows);
  assert.ok(declared.length > 0, "owners declare ops");
  const missing = declared.filter((op) => !Object.hasOwn(OPS, op));
  assert.deepEqual(missing, [], "every declared op is served by OPS");
  assert.ok(!Object.hasOwn(OPS, "nonesuchop"));
});
