/* provenance: whether this copy fetched a capture itself (R62; N806, K2333), the one definition of the source condition
   `file-safety` R6 and `case-carriage` R15 read. Every route: direct, archive.org, capture-request, a receipt with no
   via, doorbell, unrecorded, a route no ruling names, unpacked from a fetched archive and from a member's archive,
   the depth bound, a cycle, a bad locator and a failed read. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "./fixture.mjs";
import { FETCHED_VIAS, ARCHIVE_VIA, DOORBELL_VIA, UNPACKED_VIA } from "../../../src/provenance/index.mjs";
import { ARCHIVE_DEPTH_MAX } from "../../../src/ooxml.mjs";

const T = "2026-09-27T02:00:00Z";
const NOT = { fetched: false, routes: [], archive: null };
const receipt = (w, captureSha, via, extra = {}) =>
  w.prov.recordReceipt({ addressNorm: `e.org/${via ?? "none"}/${captureSha.slice(0, 8)}`, captureSha, retrieved: T,
                         ...(via === undefined ? {} : { via }), ...extra });
/* A file's receipt as `acquisition.unpack` writes it (provenance R15). */
const cut = (w, archiveSha, index, fileSha, locator = `zip:${archiveSha}!${index}`) =>
  w.prov.recordReceipt({ addressNorm: `e.org/${archiveSha.slice(0, 8)}.zip#zip:${index}`, captureSha: fileSha,
                         retrieved: T, via: UNPACKED_VIA, retrievalLocator: locator });

test("R62: FETCHED_VIAS is exactly direct, archive.org and capture-request, frozen", () => {
  assert.deepEqual([...FETCHED_VIAS], ["direct", "archive.org", "capture-request"]);
  assert.equal(FETCHED_VIAS[1], ARCHIVE_VIA);
  assert.ok(Object.isFrozen(FETCHED_VIAS));
});

test("R62: a receipt by each fetched route answers fetched, its routes named and no archive", () => {
  const w = world();
  for (const via of FETCHED_VIAS) {
    const s = sha(`fetched by ${via}`);
    receipt(w, s, via);
    assert.deepEqual(w.prov.fetchedByThisCopy(s), { fetched: true, routes: [via], archive: null }, via);
  }
  /* A receipt that names no via is recorded `direct` (R13), and reads direct. */
  const d = sha("no via given");
  receipt(w, d, undefined);
  assert.deepEqual(w.prov.fetchedByThisCopy(d), { fetched: true, routes: ["direct"], archive: null });
});

test("R62: a pulled knock, a capture with no receipt and a route no ruling names answer not fetched", () => {
  const w = world();
  const knock = sha("knock bytes");
  receipt(w, knock, DOORBELL_VIA);
  assert.deepEqual(w.prov.fetchedByThisCopy(knock), { fetched: false, routes: ["doorbell"], archive: null });
  assert.deepEqual(w.prov.fetchedByThisCopy(sha("never received")), NOT, "unrecorded");
  const mirror = sha("mirror bytes");
  receipt(w, mirror, "some-mirror");
  assert.deepEqual(w.prov.fetchedByThisCopy(mirror), { fetched: false, routes: ["some-mirror"], archive: null });
  /* A fetch beside a knock: one fetched receipt suffices, every route named, sorted. */
  receipt(w, knock, "direct");
  assert.deepEqual(w.prov.fetchedByThisCopy(knock), { fetched: true, routes: ["direct", "doorbell"], archive: null });
});

test("R62: a sha256: prefix and case are ignored; no digest or a malformed one answers not fetched", () => {
  const w = world();
  const s = sha("prefixed");
  receipt(w, s, "direct");
  assert.equal(w.prov.fetchedByThisCopy(`sha256:${s.toUpperCase()}`).fetched, true);
  for (const bad of [null, undefined, "", "abc", 42, {}]) assert.deepEqual(w.prov.fetchedByThisCopy(bad), NOT, String(bad));
});

test("R62: a file unpacked from a fetched archive is fetched, the archive named; from a member's archive it is not", () => {
  const w = world();
  const fetchedZip = sha("fetched zip"), memberZip = sha("member zip");
  receipt(w, fetchedZip, "direct");
  receipt(w, memberZip, DOORBELL_VIA);
  const a = sha("file from fetched zip"), b = sha("file from member zip"), c = sha("file of an unreceived zip");
  cut(w, fetchedZip, 0, a);
  cut(w, memberZip, 1, b);
  cut(w, sha("zip with no receipt"), 2, c);
  assert.deepEqual(w.prov.fetchedByThisCopy(a), { fetched: true, routes: ["unpacked"], archive: fetchedZip });
  assert.deepEqual(w.prov.fetchedByThisCopy(b), { fetched: false, routes: ["unpacked"], archive: memberZip });
  assert.deepEqual(w.prov.fetchedByThisCopy(c), { fetched: false, routes: ["unpacked"], archive: sha("zip with no receipt") });
  /* The same file also found in the fetched archive: one such receipt suffices (K1949), and it names that archive. */
  cut(w, fetchedZip, 5, b);
  assert.deepEqual(w.prov.fetchedByThisCopy(b), { fetched: true, routes: ["unpacked"], archive: fetchedZip });
  /* The archive's locator spelled in upper case names the same archive. */
  const u = sha("upper locator");
  cut(w, fetchedZip, 3, u, `zip:${fetchedZip.toUpperCase()}!3`);
  assert.deepEqual(w.prov.fetchedByThisCopy(u), { fetched: true, routes: ["unpacked"], archive: fetchedZip });
});

test("R62: the walk goes outward through at most ARCHIVE_DEPTH_MAX archives, and no further", () => {
  const w = world();
  /* A chain of nested archives, the outermost fetched directly: level k is cut from level k-1. */
  const level = [sha("outermost")];
  receipt(w, level[0], "direct");
  for (let k = 1; k <= ARCHIVE_DEPTH_MAX + 1; k++) {
    level.push(sha(`nested ${k}`));
    cut(w, level[k - 1], k, level[k]);
  }
  for (let k = 1; k <= ARCHIVE_DEPTH_MAX; k++)
    assert.deepEqual(w.prov.fetchedByThisCopy(level[k]), { fetched: true, routes: ["unpacked"], archive: level[k - 1] },
                     `${k} archive(s) out`);
  /* Past the bound: the fetched archive is ARCHIVE_DEPTH_MAX + 1 archives out, so this path ends not fetched. */
  const deep = sha("past the bound");
  cut(w, level[ARCHIVE_DEPTH_MAX], 9, deep);
  assert.deepEqual(w.prov.fetchedByThisCopy(deep), { fetched: false, routes: ["unpacked"], archive: level[ARCHIVE_DEPTH_MAX] });
});

test("R62: a walk that meets a digest twice ends not fetched, and never loops", () => {
  const w = world();
  const x = sha("cycle x"), y = sha("cycle y"), self = sha("cut from itself");
  cut(w, y, 0, x);
  cut(w, x, 0, y);
  cut(w, self, 0, self);
  assert.deepEqual(w.prov.fetchedByThisCopy(x), { fetched: false, routes: ["unpacked"], archive: y });
  assert.deepEqual(w.prov.fetchedByThisCopy(y), { fetched: false, routes: ["unpacked"], archive: x });
  assert.deepEqual(w.prov.fetchedByThisCopy(self), { fetched: false, routes: ["unpacked"], archive: self });
  /* A cycle beside a fetched archive: the other path still answers. */
  const z = sha("fetched beside");
  receipt(w, z, "capture-request");
  cut(w, z, 4, x);
  assert.deepEqual(w.prov.fetchedByThisCopy(x), { fetched: true, routes: ["unpacked"], archive: z });
});

test("R62: a locator not naming a 64-hex digest and a whole index ends that path not fetched", () => {
  const w = world();
  const zip = sha("a fetched zip");
  receipt(w, zip, "direct");
  const bad = [null, "", `zip:${zip}`, `zip:${zip}!`, `zip:${zip}!-1`, `zip:${zip}!1.5`, `zip:${zip.slice(1)}!0`,
               `tar:${zip}!0`, `zip:${zip}!99999999999999999999`];
  bad.forEach((locator, i) => {
    const f = sha(`bad locator ${i}`);
    cut(w, zip, i, f, locator);
    assert.deepEqual(w.prov.fetchedByThisCopy(f), { fetched: false, routes: ["unpacked"], archive: null }, String(locator));
  });
});

test("R62: a read that fails answers not fetched with no routes (fail closed), and the rule writes nothing", () => {
  const w = world();
  const s = sha("held, then unreadable");
  receipt(w, s, "direct");
  const before = w.snapshot();
  assert.equal(w.prov.fetchedByThisCopy(s).fetched, true);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  const exec = w.st.sql.exec;
  w.st.sql.exec = () => { throw new Error("storage unavailable"); };
  try {
    assert.deepEqual(w.prov.fetchedByThisCopy(s), NOT);
  } finally {
    w.st.sql.exec = exec;
  }
});

test("R62: the answer is exactly {fetched, routes, archive}, keys in that order, digests bare lowercase, no wrapper", () => {
  const w = world();
  const zip = sha("shape zip"), f = sha("shape file");
  receipt(w, zip, "direct");
  cut(w, zip, 0, f, `zip:${zip.toUpperCase()}!0`);
  const cases = [
    [`sha256:${f.toUpperCase()}`, { fetched: true, routes: ["unpacked"], archive: zip }],
    [zip, { fetched: true, routes: ["direct"], archive: null }],
    [sha("absent"), { fetched: false, routes: [], archive: null }],
    ["not a digest", { fetched: false, routes: [], archive: null }],
  ];
  for (const [asked, want] of cases) {
    const got = w.prov.fetchedByThisCopy(asked);
    assert.deepEqual(Object.keys(got), ["fetched", "routes", "archive"], asked);
    assert.deepEqual(got, want, asked);
    if (got.archive !== null) assert.match(got.archive, /^[0-9a-f]{64}$/);
  }
});
