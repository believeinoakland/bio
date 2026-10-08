/* plane R18 (N529, N532; K1332, K1333): the composition of the two modules split out in T29. `case-disclosures` is built
   with the plane's one `attestation` instance before `case-authoring`, whose lazy getter then finds that same instance;
   `case-carriage` is created by `publication`'s factory, eagerly, so its two tables exist and are declared at every boot.
   `case-disclosures` has no ops map; (T37, K2226) publication is built with the evidence bucket and the store's namespace,
   which its factory forwards to case-carriage, and case-carriage's ops map is routed directly after publication's. Each
   module's own behaviour is its own tests'; these check only the composition, through the
   plane's interface: construction over a storage and the route map. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { generateKeyPairSync } from "node:crypto";
import { store, storage, Store } from "./fixture.mjs";
import { MODULE_MAPS } from "./maps.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { attestationOf } from "../../../src/attestation/index.mjs";
import { caseAuthoringOf } from "../../../src/case-authoring/index.mjs";
import * as disclosures from "../../../src/case-disclosures/index.mjs";
import * as carriage from "../../../src/case-carriage/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { instanceSetupOf } from "../../../src/setup.mjs";
import { makePng, decodePng, bucketStandIn } from "../case-carriage/fixture.mjs";
import { sha, infoMd, provDoc } from "../provenance/fixture.mjs";

const { caseDisclosuresOf } = disclosures;
const { caseCarriageOf, CASE_CARRIAGE_EXEMPT, obscuredKey } = carriage;
const OLIVE = "member:olive";
const CC = [...CASE_CARRIAGE_EXEMPT];
const tableNames = (x) => [...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`)].map((r) => r.name);
const signingKey = () => generateKeyPairSync("ed25519").privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");

test("R18: case-disclosures is built with the plane's one attestation instance, and case-authoring's getter finds that same one instance per host", async () => {
  const x = await store({ env: { RECEIPT_SIGNING_KEY: signingKey(), INSTANCE_NAME: "oak-plane" } });
  const a = attestationOf(x.ctx), d = caseDisclosuresOf(x.ctx);
  assert.equal(d.attestation, a, "case-disclosures holds the plane's attestation");
  assert.equal(await d.attestation.instanceKeyBound(), true, "the instance holding the deployment's key");
  assert.equal(caseAuthoringOf(x.ctx).disclosures, d, "case-authoring asks the one case-disclosures instance");
  assert.equal(caseDisclosuresOf(x.ctx, { attestation: null }), d, "one instance per host: a later call's deps change nothing");
  /* negative control: on another host, another instance */
  assert.notEqual(caseDisclosuresOf(storage().ctx), d);
});

test("R18: case-carriage is publication's, created at boot: its two tables exist and are declared exempt from purge under its own name", async () => {
  const x = await store();
  const names = tableNames(x);
  for (const t of CC) assert.ok(names.includes(t), `table ${t}`);
  const rc = recordOf(x.ctx);
  for (const t of CC) {
    const r = rc.declarePurge("zz-probe", [t]);
    assert.deepEqual([r.ok, r.reason, r.declaredBy], [false, "TABLE_DECLARED", "case-carriage"], t);
  }
  assert.ok(caseCarriageOf(x.ctx).purgeDeclaration?.ok, JSON.stringify(caseCarriageOf(x.ctx).purgeDeclaration));
  /* exempt: a whole-store purge clears neither */
  x.ctx.storage.sql.exec(`INSERT INTO published_case_materials (case_id, edition, ord, sha256, held) VALUES ('CASE-x', 1, 0, '${"a".repeat(64)}', 'inline')`);
  const removed = Object.keys(rc.purge().removed);
  for (const t of CC) assert.equal(removed.includes(t), false, t);
  assert.deepEqual(caseCarriageOf(x.ctx).heldMaterialsOf("CASE-x", 1), [{ sha: "a".repeat(64), held: "inline" }], "the row stays");
  /* negative control: a table no module declared is free to a probe */
  assert.equal(rc.declarePurge("zz-probe", ["zz_none"]).ok, true);
});

test("R18, R3: a store written before case-carriage opens with its tables, and a second construction changes nothing", async () => {
  const db = new DatabaseSync(":memory:");
  const first = await store({ db });
  for (const t of CC) db.exec(`DROP TABLE IF EXISTS ${t}`);
  assert.equal(CC.some((t) => tableNames(first).includes(t)), false);
  const old = await store({ db });
  for (const t of CC) assert.ok(tableNames(old).includes(t), `table ${t}`);
  const shape = (x) => [...x.ctx.storage.sql.exec(`SELECT type, name, sql FROM sqlite_master WHERE name LIKE 'published_ma%' OR name LIKE 'published_case_ma%' ORDER BY name`)].map((r) => ({ ...r }));
  const was = shape(old);
  assert.ok(was.length >= CC.length);
  assert.deepEqual(shape(await store({ db })), was);
});

test("R18, R5 (T37, T38; K2226, K2311): case-disclosures has no ops map; case-carriage's (`obscuremark`, `photomarks`, `obscuremarkwithdraw`) is routed directly after publication's, over the one instance publication's factory made, and the route map is every module's own maps, unchanged", async () => {
  assert.deepEqual(Object.keys(disclosures).filter((k) => /Ops$|Routes$/.test(k)), [], "case-disclosures exports no ops map");
  assert.deepEqual(Object.keys(carriage).filter((k) => /Ops$|Routes$/.test(k)), ["caseCarriageOps"]);
  assert.equal(MODULE_MAPS.some(([m]) => m === "case-disclosures"), false);
  const names = MODULE_MAPS.map(([m]) => m);
  assert.equal(names.indexOf("case-carriage"), names.indexOf("publication") + 1, "directly after publication's map");
  const x = await store(), u = new URL("http://do/");
  const union = [...new Set(MODULE_MAPS.flatMap(([, f]) => Object.keys(f(x.ctx, u, null, x.env))))];
  assert.deepEqual(Object.keys(x.s.routes(u, null)).sort(), union.sort());
  /* case-carriage's whole map, pinned, and in the route map directly after publication's last op */
  const CC_OPS = ["obscuremark", "photomarks", "obscuremarkwithdraw"];
  const pub = Object.keys(MODULE_MAPS.find(([m]) => m === "publication")[1](x.ctx, u, null, x.env));
  assert.deepEqual(Object.keys(MODULE_MAPS.find(([m]) => m === "case-carriage")[1](x.ctx, u, null, x.env)), CC_OPS);
  const keys = Object.keys(x.s.routes(u, null));
  assert.deepEqual(keys.slice(keys.indexOf(pub.at(-1)) + 1, keys.indexOf(pub.at(-1)) + 1 + CC_OPS.length), CC_OPS);
  /* each of case-carriage's ops answers what that one instance answers (its refusal for a digest no photo holds) */
  const none = "e".repeat(64);
  const marks = await x.call(`/photomarks?capture=${none}&viewer=${OLIVE}`);
  assert.equal(marks.reason, "NO_SUCH_PHOTO", JSON.stringify(marks));
  assert.deepEqual(marks, JSON.parse(JSON.stringify(caseCarriageOf(x.ctx).photoMarks({ captureSha: none, viewer: OLIVE }))));
  const mark = await x.call(`/obscuremark?capture=${none}&by=${OLIVE}`, { areas: [{ rect: [0, 0, 2, 2], kind: "person" }] });
  assert.equal(mark.reason, "NO_SUCH_PHOTO", JSON.stringify(mark));
  const gone = await x.call(`/obscuremarkwithdraw?capture=${none}&by=${OLIVE}`, { mark: "MARK-none", reason: "wrong area" });
  assert.equal(gone.reason, "NO_SUCH_PHOTO", JSON.stringify(gone));
  assert.deepEqual(gone, JSON.parse(JSON.stringify(await caseCarriageOf(x.ctx).obscureMarkWithdraw({ captureSha: none, mark: "MARK-none",
    reason: "wrong area", by: OLIVE }))));
  /* negative control: a machine is refused by name before any photo is read, through the same routes */
  assert.equal((await x.call(`/obscuremark?capture=${none}&by=daemon`, { areas: [] })).reason, "MACHINE_CANNOT_MARK_PHOTO");
  assert.equal((await x.call(`/obscuremarkwithdraw?capture=${none}&by=daemon`, { mark: "MARK-none", reason: "x" })).reason,
               "MACHINE_CANNOT_WITHDRAW_MARK");
});

/* A photo held only in the evidence bucket at record-core's key (`<namespace>/captures/<sha>`, R2), registered in an
   information bundle that `member:olive` can see, its provenance recording `image/png`. */
async function photoScene({ namespace = null } = {}) {
  const CAPTURES = bucketStandIn();
  const st = storage();
  if (namespace) st.ctx.id = { equals: (n) => n === namespace, toString: () => namespace };
  const env = { STORE: { idFromName: (n) => n }, CAPTURES };
  const s = new Store(st.ctx, env);
  for (const b of st.blocked) await b;
  const sql = st.ctx.storage.sql;
  instanceSetupOf(st.ctx).instanceGroupSeed({ slug: "oak-watch", author: "admin" });
  sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
            VALUES ('olive', 'Cover olive', 'h_olive', 'member', 'active', '["contribute"]', 't', 't')`);
  const text = "the page about the photo", textPath = "snapshots/page.txt";
  const res = promotionOf(st.ctx).promote({ bundleId: "INFO-2026-0031-photo", base: null, snapKey: "ph1", author: OLIVE,
    files: [{ path: "bundle.md", text: infoMd("INFO-2026-0031-photo") }, { path: textPath, text },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc({ path: textPath, text })] }) }],
    meta: { object_type: "information" },
    register: [{ sha256: sha(text), path: textPath, encoding: "utf8", bytes: Buffer.byteLength(text) }] });
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 400));
  const png = makePng(24, 16), p = sha(png), path = "snapshots/photo.png";
  sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, 'INFO-2026-0031-photo', ?, 'binary', ?, 't')`,
           p, path, png.length);
  sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES ('INFO-2026-0031-photo', ?, NULL, ?, ?, ?)`,
           path, p, png.length, p);
  sql.exec(`UPDATE files SET content=? WHERE bundle_id='INFO-2026-0031-photo' AND path='data/provenance.json'`,
           JSON.stringify({ documents: [{ file: path, capture: { method: "acquire", grade: "B", sha256: p, encoding: "binary",
                                                                 bytes: png.length, content_type: "image/png" } }] }));
  await CAPTURES.put(`${namespace || "bio"}/captures/${p}`, png);
  const call = async (path, body = null) => {
    const op = new URL("http://do" + path).pathname.slice(1);
    return JSON.parse(JSON.stringify(await s.routes(new URL("http://do" + path), body)[op]()));
  };
  return { s, ctx: st.ctx, env, CAPTURES, png, p, call };
}

test("R18 (T37; K2226; case-carriage R11): publication is built with the `CAPTURES` bucket and the store's namespace, which its factory forwards, so a mark made through the route map holds the photo's obscured copy in that bucket under the object's own namespace", async () => {
  for (const namespace of [null, "scratch"]) {
    const x = await photoScene({ namespace });
    const ns = namespace || "bio";
    const r = await x.call(`/obscuremark?capture=${x.p}&by=${OLIVE}`, { areas: [{ rect: [2, 2, 8, 6], kind: "person" }] });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.state, "marked");
    assert.match(r.copy?.sha256 ?? "", /^[0-9a-f]{64}$/, JSON.stringify(r));
    const held = x.CAPTURES.held.get(obscuredKey(ns, r.copy.sha256));
    assert.ok(held, `the copy is held at ${obscuredKey(ns, r.copy.sha256)}`);
    assert.equal(held.opts.customMetadata.original, x.p, "labelled derived, naming its original");
    assert.equal(sha(held.bytes), r.copy.sha256);
    const copy = decodePng(held.bytes), orig = decodePng(x.png);
    assert.deepEqual(copy.at(3, 3), [0, 0, 0], "inside the area: covered");
    assert.deepEqual(copy.at(20, 12), orig.at(20, 12), "outside it: the original's pixel");
    assert.equal(x.CAPTURES.held.get(`${ns}/captures/${x.p}`).bytes.equals(x.png), true, "the original is unchanged");
    /* the route's read answers that copy */
    assert.equal((await x.call(`/photomarks?capture=${x.p}&viewer=${OLIVE}`)).copy.sha256, r.copy.sha256);
  }
  /* negative control: with no bucket bound, the mark is recorded with no copy (fail closed), nothing held anywhere */
  const bare = await store();
  assert.equal(caseCarriageOf(bare.ctx).bucket, null);
});
