/* retrieval, R90 (T51-29, T51-42; N1212; K617, K624, K3841): "Find in this" and browse are `retrieval-browse`'s, and
   retrieval's old exports and ops answer exactly what that module answers. */
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { world, V } from "./fixture.mjs";
import * as R from "../../../src/retrieval/index.mjs";
import * as B from "../../../src/retrieval-browse/index.mjs";
import { listenerRefusal } from "../../../src/membership/index.mjs";

const SRC = new URL("../../../src/retrieval/", import.meta.url);

/* A document whose page holds an amount and a date, and a question and a person to browse. */
function corpus() {
  const w = world({ members: ["ann", "vera"] });
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:ann");
  const a = w.cap("a.pdf", "a bytes");
  w.doc("INFO-A", { last_updated: "2026-10-05T00:00:00Z" }, { captures: [a] });
  w.doc("INQ-Q", { object_type: "inquiry", title: "Who pays?", last_updated: "2026-10-03T00:00:00Z" });
  w.st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, content_type, reader_version, found, entity_count, reading, at)
                 VALUES (?,?,?,1,0,0,?,?)`, a.sha, "INFO-A", "generic", JSON.stringify({ content_type: "generic", entities: [] }), "2026-10-08T00:00:00Z");
  w.unit(a.sha, "INFO-A", 0, "The grant of $40,000 was awarded on March 5, 2026.");
  /* The module over the same host reads, built apart from the one retrieval built (its own sql handle). */
  const sql = { exec: (...x) => w.st.sql.exec(...x) };
  w.apart = B.retrievalBrowseOf({ sql, membership: w.membership, host: w.host,
    sight: (v) => w.retrieval.sight(v), planOf: (i) => w.retrieval.planOf(i), runQuery: (s, t) => w.retrieval.runQuery(s, t),
    localeOf: () => w.retrieval.localeOf(), selectionRead: (x) => w.retrieval.selectionRead(x) });
  return { w, a };
}

test("R90: the old exports keep working — findIn, browse, registerRecordedBy and registerBrowseMarks answer exactly what retrievalBrowseOf answers, op=findin and op=browse through retrievalRoutes the same, and a registered stub reaches both", () => {
  const { w, a } = corpus();
  const viewer = V("vera");
  const find = { viewer, scope: { capture: a.sha }, kinds: ["money", "dates", "term"], term: "grant", limit: 5 };
  const found = w.retrieval.findIn(find);
  assert.equal(found.ok, true);
  assert.ok(found.kinds.find((k) => k.kind === "money").items.length > 0);
  assert.deepEqual(found, w.apart.findIn(find));
  assert.deepEqual(w.retrieval.browse({ viewer, limit: 5 }), w.apart.browse({ viewer, limit: 5 }));
  const route = (qs, body) => R.retrievalRoutes(w.retrieval, new URL(`http://x/?${qs}`), body);
  const v = `viewer=${encodeURIComponent(viewer)}`;
  assert.deepEqual(route(v, { scope: { capture: a.sha }, kinds: ["money", "dates", "term"], term: "grant", limit: 5 }).findin(), found);
  assert.deepEqual(route(`${v}&scope=${encodeURIComponent(JSON.stringify({ capture: a.sha }))}&kinds=money,dates,term&term=grant&limit=5`, null).findin(), found);
  assert.equal(route("kinds=money", null).findin().reason, "VIEWER_MISSING");
  assert.deepEqual(route(`${v}&kinds=document,question&limit=5`, null).browse(), w.apart.browse({ viewer, kinds: "document,question", limit: 5 }));
  assert.equal(route("kinds=document", null).browse().reason, "VIEWER_MISSING");
  /* A registered stub reaches both, through retrieval's own methods. */
  const cite = (x) => ({ ok: true, module: "citation", capture_sha: x.captureSha, truncated: false, items: [] });
  assert.equal(w.retrieval.registerRecordedBy("citation", cite).ok, true);
  assert.ok(w.retrieval.findIn(find).recorded_read.includes("citation"));
  assert.ok(w.retrieval.browseModule.findIn(find).recorded_read.includes("citation"), "the slot is the module's");
  const mark = (x) => (x.ids ? { watched: x.ids.filter((i) => i === "INFO-A"), flagged: [] } : { items: ["INFO-A"], truncated: false });
  assert.equal(w.retrieval.registerBrowseMarks("following", mark).ok, true);
  assert.deepEqual(route(`${v}&only=watched`, null).browse().items.map((i) => i.id), ["INFO-A"]);
  assert.equal(w.retrieval.browseModule.browse({ viewer, only: "watched" }).items[0].watched, true);
  /* A second registration is refused as before: the slot being the module's. */
  const again = () => ({});
  assert.deepEqual(w.retrieval.registerRecordedBy("citation", again), listenerRefusal([{ module: "citation" }], "citation", again));
  assert.equal(w.retrieval.registerRecordedBy("events", again).reason, "LISTENER_DECLARED");
  assert.equal(w.retrieval.registerBrowseMarks("other", again).reason, "LISTENER_DECLARED");
});

test("R90: the names retrieval exported from findin.mjs and browse.mjs are re-exported from retrieval's index, the module's own, and BROWSE_ID_CHUNK equals SELECTION_ID_CHUNK", () => {
  for (const n of ["FIND_KINDS", "FIND_MATCHERS", "FIND_CAPTURES_PER_CALL", "FIND_IDS_MAX", "FIND_ITEMS_DEFAULT", "FIND_ITEMS_MAX", "FIND_WORDS_MAX",
                   "FIND_TERM_MAX", "FIND_EVENT_TYPES", "FIND_PEOPLE_KINDS", "FIND_ORIGIN", "FIND_ROW_CELLS_MAX", "RECORDED_BY_MODULES",
                   "RECORDED_BY_LIMIT", "RECORDED_NONE_REGISTERED", "cutWords", "matchMoney", "matchDates", "matchRequirements", "extentOfSource",
                   "BROWSE_KINDS", "BROWSE_ONLY", "BROWSE_SCOPES", "BROWSE_LIMIT_DEFAULT", "BROWSE_LIMIT_MAX", "BROWSE_MARKS_MAX", "BROWSE_ID_CHUNK"]) {
    assert.notEqual(R[n], undefined, n);
    assert.equal(R[n], B[n], n);
  }
  assert.equal(R.BROWSE_ID_CHUNK, R.SELECTION_ID_CHUNK);
});

test("R90: retrieval holds no copy of the moved code and its source is under 4,000 lines (P6)", async () => {
  /* findin.mjs stays as a one-line re-export of the moved file (K3872), so citation's test keeps its import. */
  const shim = readFileSync(new URL("findin.mjs", SRC), "utf8").split("\n").filter((l) => l.trim() && !l.trim().startsWith("/*") && !l.trim().startsWith("*"));
  assert.equal(shim.length, 1);
  assert.match(shim[0], /^export \* from "..\/retrieval-browse\/findin\.mjs";$/);
  assert.equal((await import("../../../src/retrieval/findin.mjs")).RECORDED_NONE_REGISTERED, B.RECORDED_NONE_REGISTERED);
  assert.equal(existsSync(new URL("browse.mjs", SRC)), false);
  const lines = readdirSync(SRC).filter((f) => f.endsWith(".mjs")).reduce((n, f) => n + readFileSync(new URL(f, SRC), "utf8").split("\n").length, 0);
  assert.ok(lines < 4000, `${lines} lines`);
});

test("R90 (R14's control): with retrieval built over the module, a find over a held selection and the real recordedBy reads answer through it — retrieval hands it the five host reads and no more", () => {
  const { w } = corpus();
  const m = w.retrieval.browseModule;
  assert.deepEqual(Object.keys(m.reads).sort(), ["localeOf", "planOf", "runQuery", "selectionRead", "sight"]);
  assert.equal(B.retrievalBrowseOf({ sql: w.st.sql }), m, "one instance per storage");
});
