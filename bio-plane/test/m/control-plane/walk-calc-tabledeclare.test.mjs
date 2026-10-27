/* control-plane R17, R29 (fix round 10, final pass; K5138; item 78 (6); calculations R1, R51, find-in-forms.mjs `tabledeclare`): the walker's case through the real door.
   A member uploads a CSV (a table of payments), files it in her project, and "Find in this document" a figure of it; the found item carries no content row (a find mints nothing), and she declares
   the table from it as the Find-in screen's form sends it: `tabledeclare` with the found `{capture_sha, extent}` as `source`, the header she typed and the schema the header's columns make
   (calculations R1, R51). The door answers ok and the table is declared (not refused). Control: a declaration with no header is refused NO_HEADER, and declares nothing.
   Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "wtabdecl" });
after(() => kit.mf.dispose());
const R = kit.R;

const HEADER = ["payer", "payee", "amount"];
const CSV = [HEADER.join(","), ...Array.from({ length: 12 }, (_, i) => [`Paving Fund ${i}`, `Contractor ${i}`, String(1000 + i)].join(","))].join("\n") + "\n";

/* the form's body, as find-in-forms.mjs builds it for a found item without a content id */
const formBody = (item, capture, header) => ({ source: { capture_sha: capture, extent: item.extent }, header,
  schema: { fields: header.map((name) => ({ name, type: "string" })) } });

test("R17, R29 (calculations R1, R51): a table found in a filed CSV is declared from the found item through the door: ok, a table sha, its passage made citable; control: no header is refused NO_HEADER", { timeout: 600000 }, async () => {
  const own = await kit.ownerOf("wtabdecl-owner");
  const cs = kit.screenCall(own.auth);
  const project = await kit.projectOf(own.auth, "Payments table, item 78 (6)");
  const bytes = kit.te(CSV);
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=wtabdecl&name=wtabdecl-payments&type=text%2Fcsv`, { method: "POST", headers: own.auth, body: bytes })).json()).result;
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: "wtabdecl-payments", locator: up.document.locator, project });
  assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 400));
  const capture = kit.sha(bytes);
  const found = R(await cs.call("findin", { body: { scope: { capture }, kinds: ["term"], term: "Paving Fund 3" } }));
  const item = found.kinds && found.kinds[0] && found.kinds[0].items && found.kinds[0].items[0];
  assert.ok(item, "the table's row is found: " + JSON.stringify(found).slice(0, 500));
  assert.equal(item.content_held, false, "a find mints nothing: " + JSON.stringify(item).slice(0, 300));
  /* control first: the form with its header left empty */
  const bare = await kit.post(own.auth, "tabledeclare", { source: { capture_sha: capture, extent: item.extent }, header: [], schema: { fields: [] } });
  assert.equal(R(bare.body).ok, false, "not declared: " + kit.gateLine(bare));
  assert.equal(R(bare.body).reason, "NO_HEADER", kit.gateLine(bare));
  const declared = await kit.post(own.auth, "tabledeclare", formBody(item, capture, HEADER));
  assert.equal(declared.status, 200, kit.gateLine(declared));
  assert.equal(R(declared.body).ok, true, "the table is declared, not refused: " + kit.gateLine(declared));
  assert.match(String(R(declared.body).sha), /^[0-9a-f]{64}$/, "a table sha: " + kit.gateLine(declared));
  assert.equal(R(declared.body).source.capture_sha, capture, "from the found item's capture: " + kit.gateLine(declared));
  assert.ok(R(declared.body).source.content_id, "its passage's content row is minted by the act (R51): " + kit.gateLine(declared));
  assert.deepEqual(R(declared.body).header, HEADER);
});
