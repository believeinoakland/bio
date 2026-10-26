import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m/queue-producers";
const { world, byId, NOW, iso } = await import(`${R}/world.mjs`);
const { realChain, sha } = await import("./mp.mjs");
const { word } = await import("/home/user/bio/bio-plane/src/setup-words/index.mjs");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
const installRows = (w, table, rows) => {
  const have = new Set(w.db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name));
  for (const row of rows) { const cols = Object.keys(row).filter((c) => have.has(c));
    w.db.prepare(`INSERT OR REPLACE INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).run(...cols.map((c) => bind(row[c]))); }
};
test("queue-producers 285 / 1874", async () => {
  const ch = await realChain("b", { id: "INFO-2026-0001-big" });
  const m = ch.m, W = m.whole;
  console.log("chain register authored/whole", JSON.stringify(ch.register.map((r) => [r.whole, r.authored, r.author ?? null])));
  /* ---- 285: source-modified for an untitled multipart document; the day from register JOIN captured_locators */
  const mk = (flagged, extra = {}) => world({ monitoring: { flagged: () => ({ ok: true, limit: 200, truncated: false, items: flagged }) }, ...extra });
  const w = mk([{ bundleId: ch.id, source_status: "modified", since: iso(NOW) }, { bundleId: "B-CTL", source_status: "modified", since: iso(NOW) }]);
  w.member("alice");
  w.bundle(ch.id, "information", { title: null }); w.bundle("B-CTL", "information", { title: null });
  installRows(w, "register", ch.register);
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES (?,?,?,?,?,1)`, sha("ctl"), "B-CTL", "snapshots/c", "utf8", iso(NOW));
  const day = "2026-08-04T12:00:00Z";
  w.run(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations) VALUES (?,?,?,?,?,?,1)`, "example.org/big", "https://example.org/big", W, "direct", day, day);
  w.run(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations) VALUES (?,?,?,?,?,?,1)`, "example.org/c", "https://example.org/c", sha("ctl"), "direct", day, day);
  const out = byId(w.read("alice"));
  for (const id of [ch.id, "B-CTL"]) console.log("285 source-modified", id === "B-CTL" ? "control" : "WHOLE-keyed receipt", "summary:", JSON.stringify(out[`FINDING::source-modified::${id}`]?.summary));
  /* the same, receipt keyed by a PART (the pre-R72 shape a part-only receipt would have) */
  /* ---- 1874: authored multipart observation: parts authored by alice, whole row not */
  const OBS = "OBS-MP";
  const w2 = world({ publication: { caseDocumentFacts: (c, e) => {
    const doc = w2.db.prepare(`SELECT case_id, edition, authored_at, sig_armored FROM case_documents WHERE case_id=? AND edition=?`).get(c, e);
    return { ok: true, doc: { ...doc }, attribution: { reached: [OBS, "OBS-CTL"], legacy: [], stated: [], current: [OBS, "OBS-CTL"].map((observation) => ({ observation, level: null, shown: null, chosen_at_edition: null, why: "x" })) } }; } } });
  w2.member("alice");
  w2.bundle(OBS, "observation", { title: "observation mp" }); w2.bundle("OBS-CTL", "observation", { title: "observation ctl" });
  installRows(w2, "register", ch.register.map((r) => ({ ...r, bundle_id: OBS, authored: r.whole ? 0 : 1, author: r.whole ? null : "alice" })));
  w2.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes, authored, author) VALUES (?,?,?,?,?,1,1,?)`, sha("o2"), "OBS-CTL", "snapshots/o", "utf8", iso(NOW), "alice");
  w2.run(`INSERT INTO case_documents (case_id, edition, authored_at, sig_armored) VALUES ('CASE-1', 1, ?, NULL)`, iso(NOW - 86400000));
  const o2 = byId(w2.read("alice"));
  console.log("1874 attribution-unchosen items", JSON.stringify(Object.keys(o2).filter((k) => k.includes("attribution-unchosen"))));
  /* the same with only the whole row present as authored=0 and parts authored (done); and a bob who authored none */
  w2.member("bob");
  console.log("1874 bob's", JSON.stringify(Object.keys(byId(w2.read("bob"))).filter((k) => k.includes("attribution-unchosen"))));
});
