import { test } from "node:test";
import assert from "node:assert/strict";
export function sections(kit, counting) {
  const pdfExact = (words, n) => { const a = kit.pdfOf(words, n); return kit.pdfOf(words, n + (n - a.length)); };
  test("explore", { timeout: 900000 }, async () => {
    const auth = (await kit.ownerOf("lim-a")).auth;
    for (const n of [24 * 1048576 + 1, 24 * 1048576]) {
    const bytes = pdfExact("hello world alpha" + n, n);
    assert.equal(bytes.length, n);
    const t = Date.now();
    const res = await kit.plane(`/api/?op=captureupload&statement=s&name=n&type=application%2Fpdf`, { method: "POST", headers: auth, body: bytes });
    const j = await res.json();
    const r = j.result; delete r.document?.profile; delete r.document?.provenance_chain;
    console.log("UPLOAD", n, Date.now() - t, res.status, JSON.stringify(j).slice(0, 2500));
    const q = await kit.get(auth, { op: "owedwork", sha: kit.sha(bytes) });
    console.log("OWED", JSON.stringify(q).slice(0, 1500));
    const rd = await kit.get(auth, { op: "reading", sha256: kit.sha(bytes) });
    console.log("READING", JSON.stringify(rd).slice(0, 1500));
    }
  });
}
