/* people's ops map and invariants at its interface: R27, R29, R30, R32. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { world, ANN, BOSS } from "./fixture.mjs";
import { peopleOps, FORBIDDEN_WORDS, IDENTITY_KIND_WORDS } from "../../../src/people/index.mjs";

const SRC = fileURLToPath(new URL("../../../src/people/", import.meta.url));

test("R27 peopleOps publishes one route arm per op above, each answering what its service answers, its viewer from the query and its acts' arguments from the body", () => {
  const w = world();
  const p = w.person("Ana Bell"), q = w.person("Ana Bell");
  const url = (qs) => new URL(`https://plane.example/?${qs}`);
  const ops = peopleOps(w.p, url(""), {});
  assert.deepEqual(Object.keys(ops).sort(), ["career", "identity", "identityclaim", "identitywithdraw", "interestcheckdefine", "interestcheckgate",
    "interestchecks", "interestcheckswitch", "membertie", "membertiewithdraw", "memberties", "person", "personcredentials", "personexpunge",
    "personfact", "personfactwithdraw", "personinterests", "personstatements", "samepersoncandidates", "sourcepersonlink", "sourcepersonlinks", "staffing"].sort());
  const claim = peopleOps(w.p, url(""), { a: p, b: q, kind: "same_as", basis: "testimony", note: "n", by: ANN }).identityclaim();
  assert.equal(claim.ok, true);
  const viaOp = peopleOps(w.p, url(`id=${p}&viewer=${encodeURIComponent(ANN)}`), null).identity();
  assert.deepEqual(viaOp, w.p.identityOf({ entityId: p, viewer: ANN }));
  assert.deepEqual(peopleOps(w.p, url(`id=${p}&at=2020-01-01&viewer=${encodeURIComponent(ANN)}`), null).person(),
                   w.p.personAt({ entityId: p, at: "2020-01-01", viewer: ANN }));
  assert.equal(peopleOps(w.p, url(`id=${p}`), null).career().ok, false, "no stamped viewer: fails closed");
  const t = peopleOps(w.p, url(""), { entity: p, kind: "relative", note: "cousin", attribution: "name", by: ANN }).membertie();
  assert.equal(t.ok, true);
  assert.equal(peopleOps(w.p, url(`viewer=${encodeURIComponent(BOSS)}&member=ann`), null).memberties().count, 1);
  assert.equal(peopleOps(w.p, url(""), { claimId: claim.claim_id, reason: "no", by: ANN }).identitywithdraw().ok, true);
  assert.equal(peopleOps(w.p, url(`viewer=${encodeURIComponent(ANN)}`), null).interestchecks().ok, true);
});

test("R29 no judgment on a person: no table holds a score, rank, suspicion or conflict field, and no outward text uses 'knows', 'conflict', 'suspicious' or 'most connected'", () => {
  const w = world();
  const tables = w.record.declaredTables().filter((d) => d.module === "people").map((d) => d.name);
  for (const t of tables) {
    const cols = w.rows(`PRAGMA table_info(${t})`).map((c) => c.name);
    for (const c of cols) assert.doesNotMatch(c, /score|rank|suspic|conflict|risk|rating|likelihood|probab/i, `${t}.${c}`);
  }
  /* outward text: every string literal of the module's code, and the members' words it registers */
  for (const f of readdirSync(SRC)) {
    /* code only: comments may name what is refused, and the forbidden list itself is declared once */
    const text = readFileSync(SRC + f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").split("\n")
      .filter((l) => !/^\s*\/\//.test(l) && !l.includes("FORBIDDEN_WORDS")).join("\n");
    const literals = [...text.matchAll(/"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map((m) => m[1] ?? m[2]);
    for (const lit of literals.filter((l) => !/\b(SELECT|INSERT|UPDATE|DELETE|CREATE)\b/.test(l)))   /* SQL is not outward text */
      for (const word of FORBIDDEN_WORDS)
        if (lit.toLowerCase().includes(word)) assert.fail(`${f}: "${lit.slice(0, 80)}" says "${word}"`);
  }
  for (const k of IDENTITY_KIND_WORDS) for (const word of FORBIDDEN_WORDS) assert.ok(!k.word.includes(word));
  assert.deepEqual([...FORBIDDEN_WORDS], ["knows", "conflict", "suspicious", "most connected"]);
});

test("R30 one home per fact: this module holds no post, membership, credential, interest, tie, statement or amount; a read gathers them from their owners and stores nothing of them", () => {
  const w = world();
  const tables = w.record.declaredTables().filter((d) => d.module === "people").map((d) => d.name);
  for (const t of tables) {
    const cols = w.rows(`PRAGMA table_info(${t})`).map((c) => c.name);
    for (const c of cols) assert.doesNotMatch(c, /^(amount|currency|capacity|post|office|role|title|credential|issuer|statement|line_id|event_id|money)$/i, `${t}.${c}`);
  }
  const p = w.person("Cy Dorn");
  w.line("holds", p, w.entity("office", "Clerk"), { from: "2010-01-01", to: "2020-01-01" });
  w.line("credentialed_by", p, w.entity("institution", "Bar"), { from: "2010-01-01", to: "2020-01-01" });
  w.event("statement", { start: "2015-01-01" }, [{ entity: p, role: "speaker" }]);
  w.M.push({ fact_id: "MNY-2026-x", kind: "income", from: { entity: p }, to: { entity: p }, amount: "5" });
  const before = tables.map((t) => w.one(`SELECT COUNT(*) AS n FROM ${t}`).n);
  w.p.careerOf({ entityId: p, viewer: ANN }); w.p.credentialsOf({ entityId: p, viewer: ANN });
  w.p.statementsOf({ entityId: p, viewer: ANN }); w.p.interestsOf({ entityId: p, viewer: ANN });
  w.p.personAt({ entityId: p, at: "2015-01-01", viewer: ANN });
  assert.deepEqual(tables.map((t) => w.one(`SELECT COUNT(*) AS n FROM ${t}`).n), before, "the reads store nothing");
  /* a member's own declared tie is R20's, not a person's tie: people's ties between persons are lines (related_to) */
  assert.equal(w.p.declareTie({ entity: p, kind: "employer", note: "n", attribution: "group", by: ANN }).ok, true);
});

test("R32 no place is named in this module's behaviour, defaults or outward text; schemes, filing officers and demand kinds are profile data", () => {
  const places = ["Oakland", "Alameda", "California", "Port Ellery", "Marlow", "Gov. Code", "7928.215", "Legistar", "Form 700"];
  for (const f of readdirSync(SRC)) {
    const code = readFileSync(SRC + f, "utf8").split("\n").filter((l) => !/^\s*(\/\*|\*|\/\/)/.test(l)).join("\n")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    for (const place of places) assert.ok(!code.includes(place), `${f} names ${place} in code`);
  }
  /* the demand kinds come from the active profiles: with none active, none is listed */
  const w = world({ profiles: [] });
  const p = w.person("Di Elm");
  const c = w.capture("c");
  const f = w.p.recordPersonFact({ person: p, kind: "address", value: "x", valid: { from: null, to: null }, citation: { captureSha: c.captureSha, extent: { kind: "document" } }, by: ANN });
  const r = w.p.expunge({ id: f.fact_id, ground: "lawful_demand", demandKind: "officer_privacy", reason: "demand", by: BOSS });
  assert.equal(r.reason, "DEMAND_KIND_UNLISTED");
  assert.deepEqual(r.demand_kinds, []);
});
