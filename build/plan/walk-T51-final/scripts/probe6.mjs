import { makeKit, BIAS } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
import { CAPTURE_SCREEN } from "../../../../bio-plane/src/screens-intake/capture.mjs";
import { pngOf } from "./10a-lib.mjs";
const kit = makeKit({ tag: "w10p" });
const J = (x, n = 900) => String(JSON.stringify(x)).slice(0, n);
const R = kit.R;
try {
  const own = await kit.ownerOf("owner-a"); const cs = kit.screenCall(own.auth);
  const project = await kit.projectOf(own.auth, "Photos");
  const bytes = pngOf(64, 48, 1);
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=photo&name=photo1.png&type=image%2Fpng`, { method: "POST", headers: { ...own.auth, "content-type": "image/png" }, body: bytes })).json()).result;
  console.log("PROFILE", J(up.document.profile, 700));
  console.log("UPKEYS", J(Object.keys(up.document)), J(up.document.capture), "x");
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: "photo1", locator: up.document.locator, project });
  console.log("FILED", J(filed));
  const sel = R(await cs.call("select", { body: { ids: [filed.bundleId] } }));
  const rel = await cs.call("release", { query: { handle: sel.handle, acknowledgment: "I took this.", mitigation: "No faces." } });
  console.log("REL", J(R(rel).released));
  const q = await kit.questionOf(own.auth, project, "Does the photo show the stamp?");
  for (const kinds of [["term"], ["document"], ["image"], ["passage"]]) {
    const f = await cs.call("findin", { body: { scope: { capture: kit.sha(bytes) }, kinds, term: "stamp" } });
    console.log("FINDIN", kinds, J(f, 500));
  }
  const img = R(await cs.call("image", { query: { id: filed.bundleId } })); console.log("PROV", J(JSON.parse(img["data/provenance.json"]).documents[0].capture, 500));
  const cite = await cs.call("cite", { body: { project: q, role: "supports", found: { kind: "term", words: "photo", capture_sha: kit.sha(bytes), extent: { kind: "document" } } } });
  console.log("CITE", J(cite, 600));
  const m = await cs.call("obscuremark", { query: { capture: kit.sha(bytes) }, body: { areas: [] } });
  console.log("OBSCURE nothing", J(m, 600));
} catch (x) { console.log("ERR", x.stack.slice(0, 1500)); }
await kit.mf.dispose();
