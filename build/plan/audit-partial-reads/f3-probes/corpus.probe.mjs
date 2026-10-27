import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world } = await import(`${R}/corpus-export/fixture.mjs`);
const { infoMd } = await import(`${R}/connections/fixture.mjs`);
const { verifyCorpusExport } = await import("/home/user/bio/bio-plane/src/corpus-export/index.mjs");
const { multipartOfBytes, mpFiles, MIB, sha } = await import("./mp.mjs");
test("corpus-export over a multipart bundle", () => {
  const w = world();
  const A = "INFO-2026-0001-minutes";
  w.doc(A, ["the minutes, as captured"]);                            /* a single-part control */
  const buf = Buffer.alloc(20 * MIB + 17); for (let i = 0; i < buf.length; i += 4096) buf.writeUInt32LE(i, i);
  const m = multipartOfBytes("exp", buf);
  const id = "INFO-2026-0002-big";
  const { files, register } = mpFiles(m, { md: infoMd(id) });
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: "member:alice", files, meta: { object_type: "information" }, register });
  console.log("promote multipart", r.ok, r.reason ?? "");
  const manifest = w.ce.exportManifest({});
  const rows = manifest.register.filter((x) => x.bundle_id === id);
  console.log("manifest.register rows of the multipart bundle:", JSON.stringify(rows.map((x) => [x.capture_sha === m.whole ? "WHOLE" : "part", x.path, x.bytes])));
  /* the bytes an exporter has: the files' contents (the parts are blobs in this world: handed by their digest) and the control's */
  const bytes = w.bytesFor(manifest);
  for (const p of m.held) bytes.set(p.sha256, p.bytesBuf);               /* the exporting store holds the parts */
  const v = verifyCorpusExport({ manifest, bytes });
  console.log("verifyCorpusExport, bytes = files + parts (no whole bytes):", v.ok, JSON.stringify((v.failures || []).map((f) => [f.reason, f.path, f.capture === m.whole ? "WHOLE" : f.capture?.slice(0, 6)])));
  const bytes2 = new Map(bytes); bytes2.set(m.whole, buf);
  const v2 = verifyCorpusExport({ manifest, bytes: bytes2 });
  console.log("verifyCorpusExport, plus the whole's bytes:", v2.ok, JSON.stringify((v2.failures || []).map((f) => [f.reason, f.path])), "captures counted", v2.counts?.captures);
  /* the pre-R72 shape: drop the whole row from the manifest */
  const m0 = JSON.parse(JSON.stringify(manifest)); m0.register = m0.register.filter((x) => x.capture_sha !== m.whole);
  const v0 = verifyCorpusExport({ manifest: m0, bytes });
  console.log("verifyCorpusExport, whole row dropped (pre-R72):", v0.ok, JSON.stringify((v0.failures || []).map((f) => [f.reason])));
  /* the rendering's seesCapture(whole) */
});
