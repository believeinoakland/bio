/* acquisition R122 (T51 fix round 9, G153, G154, G156; K4958; amends R38, R114): AN ARCHIVE REFUSAL NAMES ITS DECLARED TOTAL; A FILED MEMBER WITH NO HOME IS
   OFFERED AGAIN. (1) the refused archive's answer carries `declared_total`; (2) the daemon's `op=unpack` run offers again each entry `filed` whose
   document has no home, at most 3 offers in all, then states it final with its reason; (3) `ODF_DIGEST_MAX` and `LARGE_FETCH_BYTES` are `READ_BOUNDS`' rows. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, run, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { unpack, archiveList, ODF_DIGEST_MAX, LARGE_FETCH_BYTES } from "../../../src/acquisition/index.mjs";
import { ARCHIVE_LIMITS } from "../../../src/ooxml.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";

const URL1 = "https://files.example/bundle.zip";
const zipRes = (bytes) => () => new Response(bytes, { headers: { "content-type": "application/zip" } });
const members = ["a.txt", "b.txt", "c.txt"].map((n, i) => ({ name: n, data: `member ${n} `.repeat(10 + i) }));
const daemon = { by: "daemon", cls: "daemon" };
const states = (w, s) => w.rows("SELECT idx, state, code, detail FROM archive_entries WHERE archive_sha=? AND idx>=0 ORDER BY idx", s);

async function filed() {
  const w = world();
  const r = await run(w, { [URL1]: zipRes(makeZip(members)) }, { locator: URL1 }, { settle: false, sessMember: "m1", cls: "member" });
  assert.equal(r.body.unpack.documents.length, 3);
  return { w, archive: r.body.unpack.archive.sha256, docs: r.body.unpack.documents };
}

test("R122 (1): an archive refused ARCHIVE_TOTAL_MAX names the total its listing declared, beside its limit; a sound archive carries none", async () => {
  const over = ARCHIVE_LIMITS.ARCHIVE_TOTAL_MAX;
  const tot = makeZip([{ name: "a", data: "a", local: { uncompressedSize: over }, central: { uncompressedSize: over } },
                       { name: "b", data: "b", local: { uncompressedSize: 9 }, central: { uncompressedSize: 9 } }]);
  const w = world();
  await run(w, { [URL1]: zipRes(tot) }, { locator: URL1 }, { settle: false, sessMember: "m1", cls: "member" });
  const u = await unpack(w.store, { archiveSha: sha(tot), by: "m1", cls: "member" });
  assert.equal(u.reason, "ARCHIVE_TOTAL_MAX");
  assert.equal(u.limit, over);
  assert.equal(u.declared_total, over + 9);
  const sound = await filed();
  const ok = await unpack(sound.w.store, { archiveSha: sound.archive, ...daemon });
  assert.equal(ok.declared_total, undefined, "control: only the refusal carries it at the top");
});

test("R122 (2): the daemon's run offers again an entry filed with no home, and not one that has a home (a waiting entry stays R121's, tested there)", async () => {
  const { w, archive, docs } = await filed();
  w.prov.homes[docs[0].capture.sha256] = "INFO-1";
  w.prov.homes[docs[2].capture.sha256] = "INFO-3";
  const again = await unpack(w.store, { archiveSha: archive, ...daemon });
  assert.equal(again.ok, true);
  assert.deepEqual(again.documents.map((d) => d.container.index), [1], "only the entry with no home is offered again");
  assert.equal(again.documents[0].capture.sha256, docs[1].capture.sha256);
  assert.equal(again.complete, false, "the run is not complete until the offered entry is seen to have a home");
  assert.equal(again.waiting, 1);
  w.prov.homes[docs[1].capture.sha256] = "INFO-2";
  const done = await unpack(w.store, { archiveSha: archive, ...daemon });
  assert.deepEqual([done.documents.length, done.waiting, done.complete, done.not_promoted], [0, 0, true, []]);
  assert.deepEqual(states(w, archive).map((x) => x.state), ["filed", "filed", "filed"]);
});

test("R122 (2): an entry whose document finds no home in three offers is stated final with its reason, never offered a fourth time", async () => {
  const { w, archive, docs } = await filed();
  w.prov.homes[docs[0].capture.sha256] = "INFO-1";
  w.prov.homes[docs[1].capture.sha256] = "INFO-2";
  const second = await unpack(w.store, { archiveSha: archive, ...daemon });
  assert.deepEqual([second.documents.length, second.complete, second.not_promoted.length], [1, false, 0]);
  const third = await unpack(w.store, { archiveSha: archive, ...daemon });
  assert.deepEqual([third.documents.length, third.complete, third.not_promoted.length], [1, false, 0]);
  const last = await unpack(w.store, { archiveSha: archive, ...daemon });
  assert.deepEqual([last.documents.length, last.waiting, last.complete], [0, 0, true]);
  assert.equal(last.not_promoted.length, 1);
  assert.equal(last.not_promoted[0].index, 2);
  assert.equal(last.not_promoted[0].sha256, docs[2].capture.sha256);
  assert.equal(last.not_promoted[0].code, "NOT_PROMOTED");
  assert.equal(typeof last.not_promoted[0].detail, "string");
  const row = states(w, archive)[2];
  assert.deepEqual([row.state, row.code], ["filed", "NOT_PROMOTED"], "the reason is on the entry");
  const list = await archiveList(w.store, { archiveSha: archive, viewer: "class:admin" });
  assert.equal(list.entries[2].not_promoted.code, "NOT_PROMOTED");
  assert.equal(list.entries[0].not_promoted, undefined);
  const after = await unpack(w.store, { archiveSha: archive, ...daemon });
  assert.deepEqual([after.documents.length, after.complete, after.not_promoted.length], [0, true, 0], "a final entry is not stated again");
});

test("R122 (control): a member's own run does not offer again, and a daemon run over an archive whose entries all have homes offers nothing", async () => {
  const { w, archive, docs } = await filed();
  const mine = await unpack(w.store, { archiveSha: archive, by: "m1", cls: "member", member: true });
  assert.deepEqual([mine.documents.length, mine.complete], [0, true]);
  for (const d of docs) w.prov.homes[d.capture.sha256] = `INFO-${d.container.index}`;
  const all = await unpack(w.store, { archiveSha: archive, ...daemon });
  assert.deepEqual([all.documents.length, all.complete], [0, true]);
});

test("R122 (3): ODF_DIGEST_MAX and LARGE_FETCH_BYTES are READ_BOUNDS' rows, quoted with no numeric literal", () => {
  assert.equal(ODF_DIGEST_MAX, boundOf("acquisition", "odf_digest_bytes"));
  assert.equal(LARGE_FETCH_BYTES, boundOf("acquisition", "large_fetch_bytes"));
  const src = readFileSync(new URL("../../../src/acquisition/index.mjs", import.meta.url), "utf8");
  for (const name of ["ODF_DIGEST_MAX", "LARGE_FETCH_BYTES"]) {
    const line = src.split("\n").find((l) => l.startsWith(`export const ${name} =`));
    assert.match(line, /boundOf\(/, name);
    assert.doesNotMatch(line.split("//")[0], /\d{4,}|\*\s*1024/, name);
  }
});
