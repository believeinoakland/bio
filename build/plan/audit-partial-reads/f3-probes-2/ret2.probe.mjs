import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, V, infoMd } = await import(`${R}/retrieval/fixture.mjs`);
const { EVENTS_SCHEMA } = await import("/home/user/bio/bio-plane/src/events/index.mjs");
const { multipart, mpFiles, sha } = await import("./mp.mjs");
const ids = (w, q) => w.retrieval.search({ q, viewer: V("vera"), mode: "ids", facets: false });
test("retrieval fields + frontier partitions", () => {
  const w = world();
  const m = multipart("b"); const id = "INFO-2026-0001-big";
  const { files, register } = mpFiles(m, { md: infoMd(id) });
  console.log("promote", w.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: "member:ann", files, meta: { object_type: "information" }, register }).ok);
  const c = w.cap("ctl", "ctl bytes"); w.doc("INFO-2026-0002-ctl", {}, { captures: [c] });
  w.st.db.exec(EVENTS_SCHEMA);
  const ins = (cap, ev) => w.st.sql.exec(`INSERT INTO event_attestations (event_id, form, capture_sha, extent, at) VALUES (?, 'extent', ?, '{}', 'x')`, ev, cap);
  ins(m.whole, "EVT-W"); ins(c.sha, "EVT-C");
  try { w.st.sql.exec(`INSERT INTO event_when_cache (event_id, start) VALUES ('EVT-W','2026-03-02'), ('EVT-C','2026-03-02')`); } catch (e) { console.log("when_cache insert", e.message.slice(0,80)); }
  w.st.db.exec(`CREATE TABLE IF NOT EXISTS money_facts (fact_id TEXT, source_capture_sha TEXT, kind TEXT, phase TEXT, stage TEXT, basis TEXT, period_from TEXT, period_to TEXT, from_fund TEXT, to_fund TEXT, from_entity TEXT, to_entity TEXT);
    CREATE TABLE IF NOT EXISTS money_withdrawals (fact_id TEXT);
    CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, arising_in TEXT, withdrawn_at TEXT, obligor TEXT, obligee TEXT);`);
  w.st.sql.exec(`INSERT INTO money_facts (fact_id, source_capture_sha, kind) VALUES ('F1', ?, 'grant'), ('F2', ?, 'grant')`, m.whole, c.sha);
  w.st.sql.exec(`INSERT INTO duties (duty_id, arising_in, obligor, obligee) VALUES ('D1', ?, 'ENT-X', 'ENT-Y'), ('D2', ?, 'ENT-X', 'ENT-Y')`, m.whole, c.sha);
  const rel = w.retrieval.relations().fields;
  console.log("fields available:", ["event", "occurred", "kind", "obligor", "owed_to"].map((f) => `${f}=${!!rel[f]}`).join(" "));
  for (const q of ["event:EVT-W", "event:EVT-C", "occurred:2026-03-02", "kind:grant", "obligor:ENT-X", "owed_to:ENT-Y"]) {
    const r = ids(w, q); console.log("search", q, "->", JSON.stringify((r.ids || []).map((x) => x === id ? "WHOLE-DOC" : x.includes("ctl") ? "control" : x)), r.ok === false ? (r.reason || r.code) : "", JSON.stringify(r.drops || []));
  }
  for (const sub of [m.whole, c.sha]) for (const level of ["content", "meaning"]) w.observe({ level, subject_kind: "capture", subject: sub, authority_kind: "extract", authority: id, state: level === "content" ? "LOOKED_INDETERMINATE" : "PRESENT", ...(level === "content" ? { condition: "scanned" } : {}) });
  /* frontier partitions: captures held with no row */
  for (const level of ["content", "meaning"]) {
    const f = w.retrieval.frontier({ level, viewer: V("vera") });
    const tag = (s) => s === m.whole ? "WHOLE" : m.held.some((h) => h.sha256 === s) ? "part" : s === c.sha ? "ctl" : s.slice(0, 6);
    const lists = {};
    for (const [k, v] of Object.entries(f)) if (Array.isArray(v) && v.length && v[0] && typeof v[0] === "object" && "subject" in v[0]) lists[k] = v.map((x) => tag(x.subject));
    console.log("frontier", level, JSON.stringify(lists), "keys:", Object.keys(f).filter((k) => /never|missing|unexpl/.test(k)).join(","));
  }
});
