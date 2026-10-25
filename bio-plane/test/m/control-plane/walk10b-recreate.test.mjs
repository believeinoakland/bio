/* control-plane R17, R29 (fix round 10, final pass; K5138, K5148; WALK-FINAL-10B R95 recreate, R98 (b), R182, diag2-10b.md C1 item 3; case-disclosures COMPLETE B12, build/jobs/T51/case-disclosures.md): the walker's case through the real door.
   A case is published (the prepared edition, the sitting signed with `caseratify`), then recreated two ways: (1) the served checker, the program `casechecker` hands to anybody (a public read), is run as a person
   runs it, offline, on the zip parts `publishedbytes` serves for the manifest hash, and states the finding recreated; (2) the case file is imported into a second room (`caseimport`, base64 parts) and the
   recreation recorded for the finding is `recreated`. Before the fix `findingFacts` handed the `content` table's TEXT columns `extent` and `chain` into the signed `passages:` rows, so a passage's content id
   did not recompute and every case the product published was "Did not recreate". Run against the Miniflare plane (the seam kit); the second room is a second plane of the kit. */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RESULT_WORDS } from "../../../src/case-checker/index.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "w10brec" });
const room2 = makeKit({ tag: "w10brec2" });
after(async () => { await kit.mf.dispose(); await room2.mf.dispose(); });
const R = kit.R;

let chain = null;
async function published() {
  if (chain) return chain;
  const e = await kit.preparedEdition("w10brec-owner", "w10brec", { vouch: true });
  const { res } = await kit.sitAndSign(e);
  assert.equal(res.body.ok, true, kit.gateLine(res));
  const container = R(res.body).container;
  assert.ok(container && Array.isArray(container.part_addresses) && container.part_addresses.length >= 1, "the case file is assembled: " + kit.gateLine(res));
  const parts = [];
  for (const p of container.part_addresses) {
    const got = await kit.plane(`/api/?${p.zip}`);
    assert.equal(got.status, 200, "the part is served: " + p.zip);
    parts.push(Buffer.from(await got.arrayBuffer()));
  }
  chain = { e, parts, finding: e.prepared.findings[0].target };
  return chain;
}

test("R17, R29 (case-disclosures R15; diag2-10b C1): the served checker, run as a person runs it on the zip the case's manifest hash serves, states the published finding recreated", { timeout: 900000 }, async () => {
  const c = await published();
  /* the program is a public read: no credential */
  const prog = R(await (await kit.plane("/api/?op=casechecker")).json());
  const text = prog.program ?? prog.text;
  assert.equal(typeof text, "string", "the program is served: " + JSON.stringify(prog).slice(0, 300));
  const dir = mkdtempSync(join(tmpdir(), "w10brec-"));
  try {
    writeFileSync(join(dir, "case-checker.mjs"), text);
    c.parts.forEach((p, i) => writeFileSync(join(dir, `part${i + 1}.zip`), p));
    const out = execFileSync(process.execPath, ["case-checker.mjs", ...c.parts.map((_, i) => `part${i + 1}.zip`)], { cwd: dir, encoding: "utf8", env: { PATH: process.env.PATH } });
    const line = out.split("\n").find((l) => l.startsWith(`${c.finding}:`));
    assert.ok(line, "the program states the finding: " + out.slice(0, 600));
    assert.equal(line, `${c.finding}: ${RESULT_WORDS.recreated}`, out.slice(0, 600));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("R17, R29 (case-disclosures R15; diag2-10b C1): `caseimport` of the published case file into a second room records the finding as recreated", { timeout: 900000 }, async () => {
  const c = await published();
  const member = await room2.ownerOf("w10brec-importer");
  const body = { parts: c.parts.map((p) => p.toString("base64")) };
  const imp = await room2.post(member.auth, "caseimport", body);
  assert.equal(R(imp.body).ok, true, room2.gateLine(imp));
  const rec = R(imp.body).recreation;
  assert.ok(rec && Array.isArray(rec.findings) && rec.findings.length >= 1, "a recreation is recorded: " + room2.gateLine(imp));
  assert.equal(rec.findings.find((f) => (f.finding ?? f.id) === c.finding)?.result ?? rec.findings[0].result, "recreated", room2.gateLine(imp));
});
