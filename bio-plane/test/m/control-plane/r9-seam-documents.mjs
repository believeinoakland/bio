import { test, after } from "node:test";
import assert from "node:assert/strict";
import { makeKit, MB } from "./r8-kit.mjs";
import { makeZip } from "../../make-zip.mjs";
export function sections(kit, counting) {
  test("probe", { timeout: 600000 }, async () => {
    let dk;
    dk = makeKit({ tag: "r9docs", bindings: { DAEMON_TOKEN: "dmn-r9docs-0123456789abcdef" }, serviceBindings: { SELF: (req) => dk.mf.dispatchFetch(req) } });
    after(() => dk.mf.dispose());
    const ann = (await dk.ownerOf("r9d-ann")).auth;
    const project = await dk.projectOf(ann, "R9 zip project " + Date.now());
    const tag = Date.now();
    const zip = makeZip([1,2,3].map((i) => ({ name: `m${i}.txt`, data: dk.te(`Member ${i} of the archive ${tag}. Marker ZIPWORD${i}X${tag}.\n`.repeat(3)) })));
    const res = await dk.plane(`/api/?op=captureupload&statement=zip&name=a.zip&type=application%2Fzip`, { method: "POST", headers: ann, body: zip });
    const up = await res.json();
    console.log(JSON.stringify(up).slice(0, 1500));
    const sha = up.result.capture?.sha256 ?? up.result.document?.capture?.sha256;
    for (let i = 0; i < 8; i++) {
      await dk.later(2000);
      const o = await dk.get(await dk.founder(), { op: "owedwork", sha });
      console.log(i, JSON.stringify(o).slice(0, 800));
    }
  });
}
