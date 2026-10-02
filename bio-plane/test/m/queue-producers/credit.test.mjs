/* The credit level a member has not chosen (R23; DEC-102 item 3; K1019, K1105) at feedItems' interface. The prepared,
   unsigned case editions are `case_documents`' rows (publication R56's read contract), the observations' authors
   `register`'s (provenance R48); `publication.caseDocumentFacts` is a fake answering in its R2 shape (its R17's
   attribution facts, `current` one row per reached observation with the level in force or null), fenced by standing as
   its R1 is: a viewer without standing in the case gets NO_CASE_DOCUMENT. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const DAY = 86400000;
const ofKind = (r) => r.items.filter((i) => i.kind === "attribution-unchosen");
const ids = (r) => ofKind(r).map((i) => i.id).sort();

function cases() {
  const asked = [];
  /* what each edition reaches, and the level in force for each observation (null: none chosen) */
  const reach = {
    "CASE-1@1": { "OBS-A": null, "OBS-B": null, "OBS-A2": "cover" },
    "CASE-2@1": { "OBS-A": null },                       // signed: never an item
    "CASE-3@1": { "OBS-A": null },                       // replaced by edition 2
    "CASE-3@2": { "OBS-A": null },
  };
  const standing = { "member:alice": true, "member:bob": true };   // carol has no standing in any case
  const w = world({ publication: { caseDocumentFacts: (c, e, viewer) => {
    asked.push([c, e, viewer]);
    const doc = w.db.prepare(`SELECT case_id, edition, authored_at, sig_armored FROM case_documents WHERE case_id=? AND edition=?`).get(c, e);
    if (!doc || (!doc.sig_armored && !standing[viewer])) return { ok: false, reason: "NO_CASE_DOCUMENT" };
    const r = reach[`${c}@${e}`] || {};
    return { ok: true, doc: { ...doc }, attribution: { reached: Object.keys(r), legacy: [], stated: [],
      current: Object.entries(r).map(([observation, level]) => ({ observation, level, shown: level ? "x" : null,
        chosen_at_edition: level ? e : null, why: level ? null : "its author has chosen no level for this edition or any earlier one" })) } };
  } } });
  for (const m of ["alice", "bob", "carol"]) w.member(m);
  for (const [obs, author] of [["OBS-A", "alice"], ["OBS-A2", "alice"], ["OBS-B", "bob"]]) {
    w.bundle(obs, "observation", { title: `observation ${obs}` });
    w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes, authored, author) VALUES (?,?,?,?,?,1,1,?)`,
      `sha-${obs}`, obs, "snapshots/o", "utf8", iso(NOW), author);
  }
  const doc = (c, e, at, signed = null) => w.run(`INSERT INTO case_documents (case_id, edition, authored_at, sig_armored) VALUES (?,?,?,?)`, c, e, at, signed);
  doc("CASE-1", 1, iso(NOW - 3 * DAY)); doc("CASE-2", 1, iso(NOW - DAY), "-----BEGIN SSH SIGNATURE-----");
  doc("CASE-3", 1, iso(NOW - 9 * DAY)); doc("CASE-3", 2, "not an instant");
  return { w, asked, reach };
}

test("R23: one OBLIGATION per (case edition, observation) a prepared, unsigned edition reaches that the member authored with no level chosen, keyed OBLIGATION::attribution-unchosen::<case>@<edition>::<observation>, to that member alone", () => {
  const { w, asked } = cases();
  const alice = w.read("alice");
  assert.deepEqual(ids(alice), ["OBLIGATION::attribution-unchosen::CASE-1@1::OBS-A", "OBLIGATION::attribution-unchosen::CASE-3@2::OBS-A"],
    "her observations with no level chosen; none where she chose one (OBS-A2); none on a signed edition (CASE-2) or a replaced one (CASE-3@1)");
  assert.deepEqual(asked.filter((a) => a[2] === "member:alice").map((a) => `${a[0]}@${a[1]}`), ["CASE-1@1", "CASE-3@2"],
    "the unsigned editions only, the latest of each case, each asked of caseDocumentFacts under the viewer");
  assert.deepEqual(ids(w.read("bob")), ["OBLIGATION::attribution-unchosen::CASE-1@1::OBS-B"], "bob his own, and never alice's");
  assert.deepEqual(ids(w.read("carol")), [], "a member without standing in the case is asked nothing of it");
  assert.deepEqual(ids(w.read(null, "class:admin")), [], "a caller with no member authored nothing");
  const it = byId(alice)["OBLIGATION::attribution-unchosen::CASE-1@1::OBS-A"];
  assert.deepEqual([it.class, it.kind], ["OBLIGATION", "attribution-unchosen"]);
  assert.deepEqual(it.subject, { kind: "case_edition", id: "CASE-1@1", case: "CASE-1", edition: 1, observation: "OBS-A" },
    "its subject the case edition, naming the observation");
  assert.deepEqual(it.options, [{ id: "attribute", label: "Choose how this case credits your observation", weight: "single" }],
    "offering the choice of level (publication R17, op=attribute)");
  assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 3 * DAY), ms: 3 * DAY }, "aged from the edition's preparation");
  assert.equal(byId(alice)["OBLIGATION::attribution-unchosen::CASE-3@2::OBS-A"].age.state, "undetermined");
  assert.deepEqual(it.recipients, ["alice"]);
  assert.equal(it.basis.recipients_rule, "author");
  assert.deepEqual(it.case.of, ["OBS-A"], "homed through queue's walk from the observation");
  // raised once: the same read twice is the same items
  assert.deepEqual(ids(w.read("alice")), ids(alice));
});

test("R23, R11: no item, count or detail tells another member who authored an observation", () => {
  const { w } = cases();
  for (const who of ["bob", "carol"]) {
    const text = JSON.stringify(w.read(who));
    assert.ok(!text.includes("OBS-A") && !text.includes("alice"), `${who}'s answer names neither alice nor her observations`);
  }
  const bob = JSON.stringify(w.read("bob"));
  assert.ok(bob.includes("OBS-B") && !/"(author|authored_by|author_id)":/.test(bob), "bob's own item states no author field");
  assert.ok(!JSON.stringify(w.read("alice")).includes("OBS-B"));
});

test("R23: it leaves when the member chooses a level, when the edition no longer reaches the observation, when it is signed, and when it is replaced", () => {
  const { w, reach } = cases();
  const id1 = "OBLIGATION::attribution-unchosen::CASE-1@1::OBS-A", id3 = "OBLIGATION::attribution-unchosen::CASE-3@2::OBS-A";
  assert.deepEqual(ids(w.read("alice")), [id1, id3]);
  reach["CASE-1@1"]["OBS-A"] = "project";                                     // she chooses a level
  assert.deepEqual(ids(w.read("alice")), [id3]);
  reach["CASE-1@1"]["OBS-A"] = null;
  delete reach["CASE-3@2"]["OBS-A"];                                          // the edition no longer reaches it
  assert.deepEqual(ids(w.read("alice")), [id1]);
  w.run(`UPDATE case_documents SET sig_armored='sig' WHERE case_id='CASE-1' AND edition=1`);   // signed
  assert.deepEqual(ids(w.read("alice")), []);
  reach["CASE-3@2"]["OBS-A"] = null; reach["CASE-3@3"] = { "OBS-A": null };
  w.run(`INSERT INTO case_documents (case_id, edition, authored_at, sig_armored) VALUES ('CASE-3', 3, ?, NULL)`, iso(NOW));
  assert.deepEqual(ids(w.read("alice")), ["OBLIGATION::attribution-unchosen::CASE-3@3::OBS-A"], "edition 2 replaced by edition 3");
});

test("R23: at most 200 prepared editions are read, and the cut is stated on each item", () => {
  const { w } = cases();
  for (let i = 0; i < 205; i += 1)
    w.run(`INSERT INTO case_documents (case_id, edition, authored_at, sig_armored) VALUES (?, 1, ?, NULL)`, `CASE-0${String(i).padStart(3, "0")}`, iso(NOW));
  const r = w.read("alice");
  assert.deepEqual(ids(r), [], "the first 200 editions, in case order, reach none of hers; the cut is stated, never read as complete");
  w.fakes.publication.caseDocumentFacts = (c, e) => ({ ok: true, doc: { case_id: c, edition: e, authored_at: iso(NOW), sig_armored: null },
    attribution: { current: [{ observation: "OBS-A", level: null }] } });
  const all = ofKind(w.read("alice"));
  assert.equal(all.length, 200);
  assert.ok(all.every((i) => i.basis.bound.truncated === true && i.basis.bound.editions_limit === 200));
});
