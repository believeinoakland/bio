/* mail-door R11 (never AI), R7 (what of a message is published; `publication`'s filter) and R12 (the declared ops and
   the mail entry). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, mailDoorOps } from "../../../src/mail-door/index.mjs";
import { fresh, addressFor, plain, T0 } from "./fixture.mjs";

const SRC = new URL("../../../src/mail-door/", import.meta.url);

test("R11 a static check finds no import of an AI module in this module's files", () => {
  for (const f of readdirSync(SRC)) {
    const text = readFileSync(new URL(f, SRC), "utf8");
    const specs = [...text.matchAll(/(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']/g)].map((m) => m[1] || m[2]);
    assert.ok(specs.length > 0 || f !== "index.mjs");
    for (const s of specs) assert.doesNotMatch(s, /(ai-|agent-|answers|skills|reading-guides|anthropic|openai)/i, `${f} imports ${s}`);
  }
});

test("R11 no network call is made across receiving, listing, reading, deleting and clearing a message; control: the module answers throughout", async () => {
  const calls = [];
  const keep = globalThis.fetch;
  globalThis.fetch = async (...a) => { calls.push(a); throw new Error("no network"); };
  try {
    const { d } = fresh();
    const to = await addressFor(d, "ann");
    const r = await d.receiveMail({ raw: plain("text that must go nowhere"), envelope_to: to, now: T0 });
    assert.equal(r.ok, true);
    await d.receiveMail({ raw: plain("x"), envelope_to: "nobody@mail.example.org", now: T0 });
    d.mailWaiting({ viewer: "member:ann" });
    assert.equal((await d.mailRead({ id: r.id, viewer: "member:ann" })).ok, true);
    await d.clearWaitingMail({ now: T0 + 20 * 86400000 });
    await d.mailDelete({ id: r.id, by: "member:ann" });
  } finally { globalThis.fetch = keep; }
  assert.deepEqual(calls, []);
});

test.todo("R7 a published copy shows From, To, Cc, Date and Subject without any address or technical header, a name only where marked material, the marks recorded: `publication`'s filter (N1259), not this module's");

test.todo("R12 the mail entry is the plane's `email()` export calling `receiveMail`, not an op and not a public route: waits on the measurement M1 and `plane`");

/* R12 (op-declarations R80, test-support R15): each op this module declares is held true against the op as the door runs it */
const sameOk = (x, y) => x && y && x.ok === y.ok && x.reason === y.reason;
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
const mkHeld = async () => {
  const env = fresh();
  const to = await addressFor(env.d, "ann");
  const r = await env.d.receiveMail({ raw: plain("held"), envelope_to: to, now: T0 });
  return { ...env, id: r.id };
};
const withId = (fields, env) => ("id" in fields ? { ...fields, id: env.id } : fields);
const mk = (op, stamps) => async (given) => {
  const env = await mkHeld();
  const fields = withId(given, env);
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  return await mailDoorOps(env.d, new URL("http://x/?" + q), fields)[op]();
};
const ANN = { viewer: "member:ann", by: "member:ann" };

test("R12 mail-door declares mailaddress, mailwaiting, mailread, maildelete and mailtally, each held at the door: its requires alone raise no refusal naming a field, each missing one is refused naming it", async () => {
  await declaredOpHolds({ op: "mailaddress", declaration: DECLARED_OPS.mailaddress, call: mk("mailaddress", ANN), refusedNaming: named({ act: ["REQUIRED_ARGUMENT_MISSING"] }), values: { act: "read" }, same: sameOk });
  await declaredOpHolds({ op: "mailwaiting", declaration: DECLARED_OPS.mailwaiting, call: mk("mailwaiting", ANN), refusedNaming: named({ after: ["BAD_CURSOR"] }), same: sameOk });
  await declaredOpHolds({ op: "mailread", declaration: DECLARED_OPS.mailread, call: mk("mailread", ANN), refusedNaming: named({ id: ["NO_SUCH_MAIL"] }, true), same: sameOk });
  await declaredOpHolds({ op: "maildelete", declaration: DECLARED_OPS.maildelete, call: mk("maildelete", ANN), refusedNaming: named({ id: ["NO_SUCH_MAIL"] }, true), same: sameOk });
  await declaredOpHolds({ op: "mailtally", declaration: DECLARED_OPS.mailtally, call: mk("mailtally", { viewer: "member:ann" }), refusedNaming: named({}), same: sameOk });
});

test("R12 every op declared is a route of the ops map; the five member acts need `contribute` from a member session, as captureupload does, and no machine class", async () => {
  const { d } = fresh();
  const routes = Object.keys(mailDoorOps(d, new URL("http://x/"), null));
  for (const op of Object.keys(DECLARED_OPS)) assert.ok(routes.includes(op), `${op} is declared but not routed`);
  for (const op of ["mailaddress", "mailwaiting", "mailread", "mailbringin", "maildelete"]) {
    assert.ok(DECLARED_OPS[op], op);
    assert.deepEqual([DECLARED_OPS[op].classes, DECLARED_OPS[op].machineClasses, DECLARED_OPS[op].needs], [["admin", "member"], [], "contribute"], op);
  }
  assert.deepEqual(DECLARED_OPS.mailbringin.fields.requires, ["id", "statement"]);
  assert.equal("receivemail" in DECLARED_OPS || routes.includes("receivemail"), false, "the mail entry is not an op");
});

test("R12 control: through its route a member makes, reads and turns off her address; a machine stamp is refused", async () => {
  const { d } = fresh();
  const call = (op, stamps, body) => mailDoorOps(d, new URL(`http://x/?${new URLSearchParams(stamps)}`), body)[op]();
  const made = await call("mailaddress", ANN, { act: "make" });
  assert.equal(made.ok, true);
  assert.equal((await call("mailaddress", ANN, null)).address, made.address);
  assert.deepEqual(await call("mailaddress", ANN, { act: "off" }), { ok: true, off: true });
  assert.equal((await call("mailaddress", { viewer: "class:member", by: "class:member" }, { act: "make" })).reason, "MEMBER_SESSION_REQUIRED");
});
