/* plane R16 (N522; DEC-96 items 1, 4; K1307) and R17 (N520, N522; DEC-112 (3)(6)): `accepted-work`'s one instance per
   host, made before `inquiry`'s factory and handed to every reader and to `case-import`; `case-checker` started, its two
   public reads registered with `public-read`; `case-import` built with the deps it reads, migrated, declared to purge,
   started so that it fills accepted-work's registration, and its ops map spread into the route map, each op reaching its
   handler through control-plane's door. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { store, storage, Store, STEP_ORDER } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { publicReadOf } from "../../../src/public-read/index.mjs";
import { strengthOf } from "../../../src/strength/index.mjs";
import { basisVersionsOf } from "../../../src/basis-versions/index.mjs";
import { reevaluationOf } from "../../../src/reevaluation/index.mjs";
import { caseCarriageOf } from "../../../src/case-carriage/index.mjs";
import { ratificationOf, ratificationOps } from "../../../src/ratification/index.mjs";
import { acceptedWorkOf } from "../../../src/accepted-work/index.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";
import { caseCheckerProgram, caseFileSpec, CASE_FILE_SPEC_VERSIONS } from "../../../src/case-checker/index.mjs";
import { caseImportOf, caseImportOps, CASE_IMPORT_TABLES } from "../../../src/case-import/index.mjs";

const CI = [...CASE_IMPORT_TABLES];
const tableNames = (x) => [...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`)].map((r) => r.name);
const REF = importedFindingRef("a".repeat(64), "INQ-2026-0001-held");
const LEG = { ord: 1, target: REF, target_edition: 1 };
const codes = (findings) => findings.map((f) => f.reason ?? f.code);

/* Every module that declared a table to purge, in declaration order (record-core R21), each named once. */
function declarers(x) {
  const rc = recordOf(x.ctx), out = [];
  for (const t of Object.keys(rc.purge().removed)) {
    const m = rc.declarePurge("zz-probe", [t]).declaredBy;
    if (!out.includes(m)) out.push(m);
  }
  return out;
}

test("R16: accepted-work's instance is made before inquiry's factory, on the plane's promotion, so its check is registered before the first request", async () => {
  assert.ok(REF, "the ref spells");
  const st = storage();
  /* The plane's own promotion (the order it builds it with), made first on this host so its registrations are seen. */
  const promotion = promotionOf(st.ctx, { order: STEP_ORDER });
  const seen = [];
  const was = promotion.registerStep.bind(promotion);
  promotion.registerStep = (m, s) => { seen.push(m); return was(m, s); };
  new Store(st.ctx, { STORE: { idFromName: (n) => n } });
  for (const p of st.blocked) await p;
  const at = (m) => { const i = seen.indexOf(m); assert.notEqual(i, -1, `${m} registered: ${seen.join()}`); return i; };
  assert.ok(at("accepted-work") < at("inquiry"), "accepted-work's check before inquiry's factory registers its step");
  assert.ok(at("accepted-work") < at("basis-versions") && at("accepted-work") < at("strength"), "before its readers");
  assert.equal(seen.filter((m) => m === "accepted-work").length, 1, "registered once");
  /* its rank: the modules' total order, after inquiry-grammar and before inquiry (membership R83) */
  assert.ok(STEP_ORDER.indexOf("accepted-work") > STEP_ORDER.indexOf("inquiry-grammar"));
  assert.ok(STEP_ORDER.indexOf("accepted-work") < STEP_ORDER.indexOf("inquiry"));
  /* a second registration under its name is promotion's refusal: the plane's is held */
  assert.equal(promotion.registerStep("accepted-work", { check: () => null }).ok, false);
});

test("R16: one instance per host is handed to strength, basis-versions, reevaluation, publication and case-import, and case-import's registration serves every reader", async () => {
  const x = await store();
  const aw = acceptedWorkOf(x.ctx);
  assert.equal(strengthOf(x.ctx).acceptedWork, aw, "strength");
  assert.equal(basisVersionsOf(x.ctx).acceptedWork, aw, "basis-versions");
  assert.equal(reevaluationOf(x.ctx).acceptedWork, aw, "reevaluation");
  /* publication reads accepted work through case-carriage, which its factory creates (R18; case-carriage R4) */
  assert.equal(caseCarriageOf(x.ctx).acceptedWork, aw, "publication (case-carriage)");
  assert.equal(caseImportOf(x.ctx).acceptedWork, aw, "case-import");
  /* filled by case-import before the first request, so no other module can */
  const probe = aw.registerAcceptedWork("zz-probe", { finding: () => null, openFlags: () => null, withdrawals: () => null });
  assert.equal(probe.ok, false, JSON.stringify(probe));
  assert.equal(probe.reason, "LISTENER_DECLARED");
  /* every reader reads case-import's answer: an unknown ref is not held (null), never `absent` */
  for (const [name, r] of [["strength", strengthOf(x.ctx)], ["basis-versions", basisVersionsOf(x.ctx)],
                           ["reevaluation", reevaluationOf(x.ctx)], ["publication (case-carriage)", caseCarriageOf(x.ctx)]]) {
    assert.equal(r.acceptedWork.acceptedFinding({ ref: REF, edition: 1, viewer: "member:nobody" }), null, name);
    assert.deepEqual(codes(r.acceptedWork.acceptedLegRefusals({ legs: [LEG], viewer: "member:nobody" })),
                     ["IMPORTED_NOT_ACCEPTED"], name);
    assert.ok(Array.isArray(r.acceptedWork.acceptanceWithdrawals({ after: null, limit: 10 }).withdrawals), name);
  }
  /* negative control: on a host the plane never built, nothing is registered and every read is absent */
  const bare = acceptedWorkOf(storage().ctx);
  assert.equal(bare.acceptedFinding({ ref: REF, edition: 1, viewer: "member:nobody" }).absent, true);
  assert.deepEqual(codes(bare.acceptedLegRefusals({ legs: [LEG], viewer: "member:nobody" })), ["ACCEPTED_WORK_UNREADABLE"]);
});

test("R17: case-checker is started before the first request: its two public reads are registered with public-read under its name and answer its program and specification", async () => {
  const x = await store();
  const reads = publicReadOf(x.ctx).publicReads().filter((r) => r.module === "case-checker").map((r) => r.name);
  assert.deepEqual(reads, ["casechecker", "casefilespec"]);
  /* a second registration of either name is refused: the plane's stands */
  assert.equal(publicReadOf(x.ctx).registerPublicReads("zz-probe", { casechecker: () => ({}) }).ok, false);
  /* through control-plane's door, as `op=publicread&name=` */
  const v = CASE_FILE_SPEC_VERSIONS[0];
  const spec = await (await x.fetch(`/publicread?name=casefilespec&version=${encodeURIComponent(v)}`)).json();
  assert.deepEqual(spec.result.result, caseFileSpec(v));
  const prog = await (await x.fetch(`/publicread?name=casechecker`)).json();
  assert.equal(prog.result.module, "case-checker");
  assert.equal(prog.result.result.sha256, caseCheckerProgram().sha256);
  /* negative control: an unknown version is answered with the versions held */
  const none = await (await x.fetch(`/publicread?name=casefilespec&version=zz`)).json();
  assert.equal(none.result.result.held, false);
});

test("R17: case-import is built after publication, docket and strength and before case-authoring, creates its tables and declares them to purge under its own name", async () => {
  const x = await store();
  const names = tableNames(x);
  for (const t of CI) assert.ok(names.includes(t), `table ${t}`);
  const rc = recordOf(x.ctx);
  for (const t of CI) assert.equal(rc.declarePurge("zz-probe", [t]).declaredBy, "case-import", t);
  const order = declarers(x);
  const at = (m) => { const i = order.indexOf(m); assert.notEqual(i, -1, `${m} declared: ${order.join()}`); return i; };
  assert.ok(at("publication") < at("case-import") && at("docket") < at("case-import"), "after layer 8's earlier modules");
  assert.ok(at("strength") < at("case-import"), "after strength, which it reads");
  assert.ok(at("case-import") < at("case-authoring"), "before case-authoring");
  assert.ok(at("case-import") < at("local-facts"), "before layer 9");
  /* negative control: a table no module declared is free to a probe */
  assert.equal(rc.declarePurge("zz-probe", ["zz_none"]).ok, true);
});

test("R17, R3: a store written before case-import opens with its tables, and a second construction changes nothing", async () => {
  const db = new DatabaseSync(":memory:");
  const first = await store({ db });
  for (const t of CI) db.exec(`DROP TABLE IF EXISTS ${t}`);
  assert.equal(CI.some((t) => tableNames(first).includes(t)), false);
  const old = await store({ db });
  for (const t of CI) assert.ok(tableNames(old).includes(t), `table ${t}`);
  const shape = (x) => [...x.ctx.storage.sql.exec(`SELECT type, name, sql FROM sqlite_master WHERE name LIKE 'case_import%' ORDER BY name`)].map((r) => ({ ...r }));
  const was = shape(old);
  assert.ok(was.length >= CI.length);
  const again = await store({ db });
  assert.deepEqual(shape(again), was);
});

test("R17: case-import is built with the deps it reads (strength, reevaluation, accepted-work's instance) and the plane's environment, and started", async () => {
  const x = await store({ env: { BIO_NOW_MS: "1790000000000" } });
  const ci = caseImportOf(x.ctx);
  assert.equal(ci.strength, strengthOf(x.ctx));
  assert.equal(ci.reevaluation, reevaluationOf(x.ctx));
  assert.equal(ci.acceptedWork, acceptedWorkOf(x.ctx));
  assert.equal(ci.env, x.env, "case-import holds the object's environment");
  assert.deepEqual(ci.registration, { ok: true, module: "case-import" });
});

/* Instants and minted ids differ between two objects; everything else must not. */
const mask = (text) => text.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<instant>");

test("R17, R5: every op of case-import's map is in the route map and answers through control-plane's door what its own map answers called directly", async () => {
  const u = new URL("http://do/");
  const ops = Object.keys(caseImportOps(null, u, null));
  assert.deepEqual(ops, ["caseimport", "importedcases", "importedcase", "caseimportdocument", "importaccept",
                         "importacceptwithdraw", "importflag", "importflagclear"]);
  const x = await store(), twin = await store();
  const map = Object.keys(x.s.routes(u, null));
  for (const op of ops) assert.ok(map.includes(op), `the route map lacks ${op}`);
  /* at its place: directly after ratification's ops, in its own map's order */
  const rat = Object.keys(ratificationOps(ratificationOf(x.ctx), u, null));
  assert.deepEqual(map.slice(map.indexOf(rat[rat.length - 1]) + 1).slice(0, ops.length), ops);
  for (const op of ops) {
    const path = `${op}?viewer=member:nobody&by=member:nobody&import=${"0".repeat(64)}&edition=1&flag=F-none`;
    const res = await x.fetch(`/${path}`, { method: "POST", body: "{}" });
    const direct = await caseImportOps(caseImportOf(twin.ctx), new URL(`http://do/${path}`), {})[op]();
    assert.equal(res.status, 200, op);
    assert.deepEqual(JSON.parse(mask(await res.text())), JSON.parse(mask(JSON.stringify({ ok: true, result: direct }))), op);
  }
  /* negative control: a machine's import is case-import's own refusal, inside the door's envelope */
  const machine = await (await x.fetch("/caseimport?viewer=class:admin&by=token:admin", { method: "POST", body: "{}" })).json();
  assert.deepEqual([machine.ok, machine.result.ok, machine.result.reason], [true, false, "MACHINE_CANNOT_IMPORT"]);
});
