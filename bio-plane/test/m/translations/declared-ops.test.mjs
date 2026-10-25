/* translations R18 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, translationsOps } from "../../../src/translations/index.mjs";
import { boot } from "./fixture.mjs";
import { world as aiAccountsWorld } from "../ai-accounts/fixture.mjs";
import { list as jList, get as jGet, combine as jCombine } from "../../../../jurisdictions/index.mjs";
import { interfaceWords } from "../../../src/translations/index.mjs";
const ORDINARY = interfaceWords().find((w) => !w.protected && !/\{/.test(w.en));
const PROTECTED = interfaceWords().find((w) => w.protected && !/\{/.test(w.en));
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* the founder `admin` and members ruth, sam and tom; ruth and sam asked to translate es; when asked, ruth has kept an ordinary word, or a protected one that now awaits a second check */
const mkWorld = async ({ adopted = false, awaiting = false } = {}) => {
  const c = aiAccountsWorld();
  await c.group("ruth", "sam", "tom");
  let t = Date.parse("2026-10-08T10:00:00Z");
  const w = boot({ now: () => (t += 1000), more: { membership: c.m, aiAccounts: c.a, jurisdictions: { list: jList, get: jGet, combine: jCombine } } });
  assert.deepEqual(w.m.registerMemberLanguageRead(() => ({ ok: true, language: null, set_at: null })), { ok: true });
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin");
  for (const who of ["ruth", "sam"]) assert.equal(w.m.translationGrant({ member: who, language: "es", by: "admin" }).ok, true);
  if (adopted) assert.equal(w.m.translationAdopt({ language: "es", key: ORDINARY.key, text: "Algo", by: "ruth" }).ok, true);
  if (awaiting) assert.equal(w.m.translationAdopt({ language: "es", key: PROTECTED.key, text: `ES ${PROTECTED.en}`, by: "ruth" }).state, "awaiting");
  return { ...w, c };
};

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkWorld());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (translationsOps(env.m, url, fields)[op]());
};

test("R18 translations declares translationgrant: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "translationgrant", declaration: DECLARED_OPS["translationgrant"], call: mk("translationgrant", {"by":"admin"}),
    refusedNaming: named({"member":["NO_SUCH_MEMBER"],"language":["LANGUAGE_MALFORMED"]}, true), values: {"member":"tom","language":"es"}, same: sameCode });
});

test("R18 translations declares translationadopt: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "translationadopt", declaration: DECLARED_OPS["translationadopt"], call: mk("translationadopt", {"by":"ruth"}),
    refusedNaming: named({"language":["LANGUAGE_MALFORMED"],"key":["NO_SUCH_WORD"],"text":["TRANSLATION_TEXT_REFUSED"]}, true), values: { language: "es", key: ORDINARY.key, text: "Algo" }, same: sameCode });
});

test("R18 translations declares translationconfirm: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "translationconfirm", declaration: DECLARED_OPS["translationconfirm"], call: mk("translationconfirm", {"by":"sam"}, async () => (mkWorld({ awaiting: true })), null),
    refusedNaming: named({"language":["LANGUAGE_MALFORMED"],"key":["NO_SUCH_WORD"]}, true), values: { language: "es", key: PROTECTED.key }, same: sameCode });
});

test("R18 translations declares translationrevert: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "translationrevert", declaration: DECLARED_OPS["translationrevert"], call: mk("translationrevert", {"by":"admin"}, async () => (mkWorld({ adopted: true })), null),
    refusedNaming: named({"language":["LANGUAGE_MALFORMED"],"key":["NO_SUCH_WORD"]}, true), values: { language: "es", key: ORDINARY.key }, same: sameCode });
});

test("R21 translations declares interfacewords: no field is required, so the call with none raises no refusal naming a declared field, and a field outside accepts (language and v are the two it takes) is dropped or refused", async () => {
  const d = DECLARED_OPS["interfacewords"];
  assert.deepEqual([d.fields.requires, d.fields.accepts, d.stamps, d.mutating, d.weight, d.classes, d.machineClasses], [[], ["language", "v"], ["viewer"], false, "read", ["admin", "member"], []]);
  await declaredOpHolds({ op: "interfacewords", declaration: d, call: mk("interfacewords", { viewer: "ruth" }),
    refusedNaming: named({ language: ["LANGUAGE_MALFORMED"] }, true), values: {}, same: sameCode });
});
