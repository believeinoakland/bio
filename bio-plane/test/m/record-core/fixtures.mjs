/* record-core's published fixtures (K4990, K4993, K4995, K5044): what record-core answers to a caller that declares a
   table, reads a bundle, stores a document from parts or applies a set of items, made by record-core's own code when
   the test runs and never stored. A user's test takes the answer from here and does not write it by hand. Each is
   called by a test of record-core's own, `fixtures.test.mjs`, which checks the real answer. */
import { createHash } from "node:crypto";
import { recordOf, perItem } from "../../../src/record-core/index.mjs";
import { storage, multipartBucket } from "./storage.mjs";

const KEY = "bio/captures/";
const CLASSES = { purge: "clear", expunge: "none", export: "admin-only", sight: "bundle", derive: "stored", version_chain: false };
const entryOf = (name, more = {}) => ({ name, ...CLASSES, ...more });

/* `recordOf` migrated over the test's own SQLite database `db` (a `node:sqlite` DatabaseSync, with no `bundles` table
   yet: record-core makes its own), with the three answers a user module reads or calls: `bundleInfo`, `declarePurge`
   and `declareTable`. `addBundle` writes a bundle row of record-core's own table, the way a committed bundle leaves it. */
export function coreOver(db) {
  const rc = recordOf({ storage: storage({ db }) });
  rc.migrate();
  return {
    rc,
    bundleInfo: (id) => rc.bundleInfo(id),
    declarePurge: (module, tables, opts) => rc.declarePurge(module, tables, opts),
    declareTable: (module, entries) => rc.declareTable(module, entries),
    addBundle(id, type, title = null, project = null) {
      db.prepare(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, project)
                  VALUES (?, ?, 'test-group', ?, 'draft', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', ?, ?)`)
        .run(id, type, title, "0".repeat(64), project);
    },
  };
}

/* `evidenceStore().putFromParts(digest, parts)` on a record-core whose evidence bucket refuses the whole object:
   the answer when the store's completion fails (`refused`), and when the store's upload cannot even begin and throws
   (`threw`): both EVIDENCE_STORE_REFUSED (C-102.39). Each has a digest and parts the bucket holds. */
export async function evidencePartsRefusal() {
  const sha = (b) => createHash("sha256").update(b).digest("hex");
  const make = (bucket) => {
    const one = new Uint8Array([1, 2, 3, 4]), two = new Uint8Array([5, 6, 7, 8]);
    for (const p of [one, two]) bucket.held.set(`${KEY}${sha(p)}`, p);
    const rc = recordOf({ storage: storage() }, { evidence: bucket, evidencePrefix: KEY }); rc.migrate();
    return rc.evidenceStore().putFromParts(sha(new Uint8Array([...one, ...two])), [sha(one), sha(two)]);
  };
  const refusing = multipartBucket({ failComplete: "R2 is down" });
  const throwing = multipartBucket();
  throwing.createMultipartUpload = async () => { throw new Error("R2 would not begin the upload"); };
  return { refused: await make(refusing), threw: await make(throwing) };
}

/* `perItem(op, {items}, stamped, one)` where one item applies and one is refused (a non-object item, SET_ITEM_MALFORMED):
   SET_ITEMS_RETAINED with `items[]`, `applied` 1, `retained` 1 and `count` 2. `one` records what it was given. */
export function perItemRetained(op = "taskresolve", stamped = { actor: "m" }) {
  const seen = [];
  const one = (b) => { seen.push(b); return { ok: true, id: b.id }; };
  return { answer: perItem(op, { items: [{ id: "a" }, "not an item"] }, stamped, one), seen };
}

/* The real `declarePurge` / `declareTable` refusals for one table: declared once by `by`, then again by another module
   (TABLE_DECLARED with `declaredBy`, from each of the two calls), with an invalid name (TABLE_NAME_INVALID) and with a
   value outside a class (TABLE_CLASS_UNKNOWN). */
export function tableDeclarationRefusals(table = "t1", { by = "first" } = {}) {
  const rc = recordOf({ storage: storage() });
  rc.migrate();
  const first = rc.declareTable(by, [entryOf(table)]);
  return {
    first,
    declaredAgainByPurge: rc.declarePurge(`${by}-again`, [table]),
    declaredAgainByTable: rc.declareTable(`${by}-again`, [entryOf(table)]),
    invalidName: rc.declareTable(by, [entryOf("bad name")]),
    unknownClass: rc.declareTable(by, [entryOf(`${table}_x`, { purge: "sometimes" })]),
  };
}
