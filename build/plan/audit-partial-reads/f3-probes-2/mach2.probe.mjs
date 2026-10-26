import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m/machinery-producers";
const { world, byId, NOW, iso } = await import(`${R}/world.mjs`);
const { realChain, sha } = await import("./mp.mjs");
const { MACHINE_AUTHOR_PREFIX } = await import("/home/user/bio/bio-plane/src/record-grammar/actors.mjs");
const HOST = "www.example.gov", ADDR = `https://${HOST}/documents/big.pdf`;
test("machinery 307 / 539", async () => {
  const ch = await realChain("b", { id: "INFO-88" });
  const holds = [{ host: HOST, cooloff_until: NOW + 90000, refusals: 1, last_refusal_status: 429, last_refusal_at: NOW - 30000, appetite_per_min: 60, granted: 4, refused_total: 1 }];
  const w = world({ governor: { governorHolding: ({ now }) => holds.filter((h) => h.cooloff_until > now) },
                    provenance: { homeOf: (s) => ch.w.prov.homeOf(s) } });
  w.member("carol");
  w.bundle("INFO-88", "information", { title: "Controller memo" });
  /* install real chain's rows */
  const have = new Set(w.db.prepare(`PRAGMA table_info(register)`).all().map((c) => c.name));
  for (const row of ch.register) { const cols = Object.keys(row).filter((c) => have.has(c));
    w.db.prepare(`INSERT OR REPLACE INTO register (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).run(...cols.map((c) => row[c] ?? null)); }
  w.run(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations) VALUES (?,?,?,?,?,?,1)`, ADDR, ADDR, ch.m.whole, "direct", iso(NOW), iso(NOW));
  const man = (key, author, created) => w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json) VALUES ('INFO-88', ?, 'revision', 'b', ?, ?, '[]')`, key, author, created);
  man("k1", "carol", "2026-07-31T12:00:00Z"); man("k2", `${MACHINE_AUTHOR_PREFIX}member`, "2026-07-31T18:00:00Z");
  const m = byId(w.read("carol"));
  const g = m[`CONDITION::governor-holding-host::${HOST}`], u = m["CONDITION::capture-completed-unattended::INFO-88"];
  console.log("307 governor-holding-host subject.bundles", JSON.stringify(g?.subject.bundles), "case", g?.case.state);
  console.log("539 capture-completed-unattended", u ? JSON.stringify([u.kind, u.subject.id]) : "NO ITEM");
  /* controls: the same with the whole row removed (pre-R72) -> the parts-only register has no receipt join */
  w.run(`DELETE FROM register WHERE capture_sha=?`, ch.m.whole);
  const m2 = byId(w.read("carol"));
  console.log("   whole row removed (pre-R72 shape): 307", JSON.stringify(m2[`CONDITION::governor-holding-host::${HOST}`]?.subject.bundles), "| 539", m2["CONDITION::capture-completed-unattended::INFO-88"] ? "item" : "no item");
});
