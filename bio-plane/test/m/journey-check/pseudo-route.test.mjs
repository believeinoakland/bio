/* journey-check R29 (a) (K4435): the pseudo route makes the words pseudo wherever the page carries them. Since interface-shell's
   fix round 3 (R1) the page's words stand in the shell's own external script, at the address that carries the release version,
   not in the HTML document; the route answers that script, as it answers a document and a fetch, with every keyed sentence
   pseudo. No browser: the route's handler is run against a request of each kind. */
import "../screens-settings/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";

const { pseudoRoute } = await import("../../../src/journey-check/pseudo.mjs");
const { interfaceScript } = await import("../../../src/interface-shell/index.mjs");
const { SCREENS: SETTINGS } = await import("../../../src/screens-settings/index.mjs");
const { WORD_ROWS } = await import("../../../src/setup-words/index.mjs");

const HOST = "copy.test";
const { pseudo } = await import("../../../src/setup-words/build.mjs");

/* Runs the route's handler for one request: answers the body the browser would receive, and whether the route fell back. */
async function through({ type, url, contentType, body }) {
  let handler;
  await pseudoRoute({ route: async (_pattern, h) => { handler = h; } }, { host: HOST,
    fetchCopy: async () => new Response(body, { headers: { "content-type": contentType } }) });
  let fulfilled = null, fellBack = false;
  await handler({ request: () => ({ url: () => url, resourceType: () => type, method: () => "GET", headers: () => ({}), postDataBuffer: () => null }),
    fallback: async () => { fellBack = true; }, fulfill: async (r) => { fulfilled = r; } });
  return { fulfilled, fellBack, text: fulfilled ? fulfilled.body.toString("utf8") : null };
}

const KEYED = WORD_ROWS.find((r) => typeof r[1] === "string" && /\S\s+\S/.test(r[1]) && !/[{}"\\]/.test(r[1]));

test("R29 (a): the shell's script, which carries the page's words, is answered with every keyed sentence pseudo; control: a script of another host, and a style sheet, are left to the routes before it", async () => {
  const script = interfaceScript(SETTINGS);
  assert.ok(script.includes(JSON.stringify(KEYED[1])), "the shell's script carries the sentence in English");
  const r = await through({ type: "script", url: `https://${HOST}/app/shell.v1.js`, contentType: "text/javascript", body: script });
  assert.ok(!r.fellBack, "the route answers the shell's script");
  assert.ok(r.text.includes(JSON.stringify(pseudo(KEYED[1]))), "the sentence is pseudo");
  assert.ok(!r.text.includes(`["${KEYED[0]}",${JSON.stringify(KEYED[1])}`), "its English pair is gone");
  assert.equal((await through({ type: "script", url: "https://elsewhere.test/x.js", contentType: "text/javascript", body: script })).fellBack, true);
  assert.equal((await through({ type: "stylesheet", url: `https://${HOST}/app/x.css`, contentType: "text/css", body: "a{}" })).fellBack, true);
});

test("R29 (a): the document's script tag carries no integrity hash once its script is rewritten (the hash is of the English script, and a browser refuses the pseudo one); the rest of the document is as it was", async () => {
  const page = '<!doctype html><html><head><title></title></head><body><script src="/app/shell.v1.js" integrity="sha256-AAAA"></script><p id="x">kept</p></body></html>';
  const r = await through({ type: "document", url: `https://${HOST}/app/home`, contentType: "text/html", body: page });
  assert.ok(!/integrity=/.test(r.text), r.text);
  assert.ok(r.text.includes('<script src="/app/shell.v1.js"></script>') && r.text.includes('<p id="x">kept</p>'));
  const other = await through({ type: "document", url: `https://${HOST}/app/home`, contentType: "text/html", body: '<link rel="stylesheet" href="/a.css" integrity="sha256-BBBB">' });
  assert.ok(other.text.includes('integrity="sha256-BBBB"'), "only a script's hash is dropped");
});
