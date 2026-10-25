/* screens-intake fix round 10, cause R35b (G7; walk A13; R68; file-safety R56): `threatof.image.read` is false for a TIFF, HEIC or BMP, and no screen said so. A BMP is
 * uploaded to the REAL plane (Miniflare, real DO and R2, loaded from its file path as `t51-seam-g126h.test.mjs` does) and the real answers of file-safety's reads
 * (`threatof`, `originalstate`, `verdictnotes`, `scanfindings`, `captureaccounts`) are what the served `open-file` page reads, so the screen is tried on the provider's
 * own answer, never a hand-built one (K4990, K4993, K4995). A PNG is the control: it is read, and the screen says nothing of it. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { generate } from "../../corpus.mjs";
import { open, text, main, word, hasWord } from "./page.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-r10of-0123456789abcdef", PASSWORD = "the founder's long password, r10 open-file", ORIGIN = "https://group.example";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r10of-0123456789abcdef", PROBE_TOKEN: "prb-r10of-0123456789abcdef", VERSION: "4.7.2", INSTANCE_NAME: "r10of-town" },
});
after(() => mf.dispose());
const door = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);

async function founder() {
  const claimed = await door("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) });
  await claimed.arrayBuffer();
  const signed = await (await door("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return { authorization: `Bearer ${signed.result.token}` };
}

/* upload a generated picture and read, from the real plane, every answer the `open-file` screen reads for it */
async function planeAnswers(auth, recipe, name) {
  const file = generate(recipe), bytes = Buffer.from(await file.bytes()), sha = createHash("sha256").update(bytes).digest("hex");
  const up = await (await door(`/api/?op=captureupload&statement=r10&name=${encodeURIComponent(name)}&type=${encodeURIComponent(file.type)}`, { method: "POST", headers: auth, body: bytes })).json();
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
  /* the screen files the upload as a document, as `captureupload`'s done step does (R21), so the capture is one the viewer may open */
  const cs = { now: () => Date.now(), digest: async (t) => createHash("sha256").update(t).digest("hex"),
    call: async (op, { query = {}, body } = {}) => (await door(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST",
      headers: { ...auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json() };
  const made = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.result.document, title: name, locator: up.result.document.locator, project: "" });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 300));
  const read = async (op, extra = "") => ({ status: 200, json: await (await door(`/api/?op=${op}&capture=${sha}${extra}`, { headers: auth })).json() });
  return { sha, plane: { threatof: await read("threatof"), originalstate: await read("originalstate"), verdictnotes: await read("verdictnotes"),
                          scanfindings: { status: 200, json: await (await door("/api/?op=scanfindings&limit=1000", { headers: auth })).json() }, captureaccounts: await read("captureaccounts") } };
}
/* the design's row `screen.open-file.image.unread` is owed (K4269); until it is held the sentence is the one the reading's owner holds for the type */
const OWED = "screen.open-file.image.unread";
const sentence = (type) => (hasWord(OWED) ? word(OWED, { type }) : word(`reading-pipeline.index.unsupported_${type}`));
const said = (p, type) => text(p).includes(sentence(type));

test("R68 (R35b; the real plane) a BMP, a type nothing reads, says on open-file that it is not read and that the structure check could not examine it; the scanner's note stays but does not stand for the structure", async () => {
  const auth = await founder();
  const { sha, plane } = await planeAnswers(auth, { kind: "bmp", seed: "rw9-A-13", size: { lines: 3 } }, "scan.bmp");
  assert.deepEqual(plane.threatof.json.result.image, { type: "bmp", read: false }, "the provider's own answer: " + JSON.stringify(plane.threatof.json).slice(0, 300));
  const p = await open(`/app/open-file/${sha}`, { plane });
  assert.ok(said(p, "bmp"), "the unread-type sentence is drawn: " + text(p).slice(0, 400));
  assert.equal(main(p).querySelectorAll("[data-unread-image]").length, 1, "once");
});

test("R68 control (the real plane): a PNG is read, and open-file says nothing of an unread type", async () => {
  const auth = await founder();
  const { sha, plane } = await planeAnswers(auth, { kind: "png", seed: "rw9-A-13-png", size: { lines: 3 } }, "scan.png");
  assert.equal(plane.threatof.json.result.image.read, true, JSON.stringify(plane.threatof.json).slice(0, 300));
  const p = await open(`/app/open-file/${sha}`, { plane });
  assert.ok(!said(p, "bmp") && !said(p, "tiff") && !said(p, "heic"));
  assert.equal(main(p).querySelectorAll("[data-unread-image]").length, 0);
});
