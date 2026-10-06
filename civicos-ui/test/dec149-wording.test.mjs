/* DEC-149 (T34-87; K1784, K1811, K1821 (2)) — THE MEMBER-FACING STRINGS THAT CALLED THE GROUP'S CIVICSMITH "this copy",
 * "this instance", "this plane" or "the plane" now say "your group's Civicsmith", or "this group's Civicsmith" where a
 * reader with no credential is answered too, or need no name. legacy-ui's 36 rows of `build/plan/draft-T34-dec149.md`
 * (LEGACY-UI #2): 33 re-worded; the three inside the review copy (:26107, :26122, :26148, "this copy" OF A REVIEW) stay,
 * as DEC-149 keeps a review copy's own name.
 *
 * WHAT IS DRIVEN: the strings the page's script answers through a function or a table it reads (the group line, the
 * refusal panes, the screen purposes, the glossary, the queue's levels) are read from the RUNNING script in a vm. The
 * strings composed inside larger render paths are read in the page AS SERVED (`app.html` is what a member's browser
 * receives), each new sentence present and the old one gone.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import vm from "vm";
import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

const PAGE = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");

function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", addEventListener(){}, querySelector:()=>el(), querySelectorAll:()=>[],
    insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, setAttribute(){}, getAttribute(){ return null; } };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:()=>1, requestAnimationFrame:()=>1, matchMedia:()=>({matches:false}),
  document:{ querySelector:()=>el(), querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
  localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} }, sessionStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  window:{ addEventListener(){}, open:()=>null },
  fetch: async () => ({ ok: false, status: 502, json: async () => { throw new Error("not JSON"); } }) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = { GROUP_WORDS, SURFACES, GLOSSARY, teach, errPane, notifClassLine, rec, recPost };", ctx);
const U = ctx.__U;
const OLD = /\b(this|the) (copy|instance|plane)\b/i;

test("DEC-149: the group line, which a stranger on the public page is shown too, names no copy", () => {
  assert.equal(U.GROUP_WORDS.silent, "Could not read this group just now");
  assert.equal(U.GROUP_WORDS.none, "No group is recorded yet");
  assert.equal(PAGE.split('data-group="silent">Could not read this group just now<').length - 1, 3,
    "the three places the page paints the group line before it has read it");
  assert.ok(!PAGE.includes("This copy could not read its group") && !PAGE.includes("recorded for this copy"));
});

test("DEC-149: an answer that is not JSON, to a member's read and write, says your group's Civicsmith", async () => {
  const said = "your group's Civicsmith did not answer in a form this page can read";
  await assert.rejects(U.rec("record"), (j) => j.error === said);
  await assert.rejects(U.recPost("promote", {}), (j) => j.error === said);
  assert.ok(!PAGE.includes("the plane did not return JSON"));
});

test("DEC-149: a refusal with no words of its own, on a member's form and on a page a stranger may open", () => {
  const box = el();
  U.teach(box, null);
  assert.equal(box.innerHTML, "Could not reach your group's Civicsmith. If this page is a local file opened against a "
    + "remote Civicsmith, that Civicsmith must allow cross-origin reads.");
  assert.ok(U.errPane(null).includes("Could not reach this group's Civicsmith."), "errPane also serves the public page");
});

test("DEC-149: the screen purposes and the glossary", () => {
  const P = Object.fromEntries(Object.entries(U.SURFACES).map(([k, v]) => [k, v.purpose]));
  for (const [k, p] of Object.entries(P)) assert.ok(!OLD.test(p || ""), `${k}: ${p}`);
  assert.match(P.published, /^The cases this group's Civicsmith has published, readable by somebody holding no credential/);
  assert.match(P["published-case"], /with this group's Civicsmith's own account of why/);
  assert.match(P["review-copy"], /Nothing on it leaves your group's Civicsmith\.$/);
  assert.ok(Object.values(P).some((p) => /^Who holds what in your group's Civicsmith:/.test(p)));
  assert.ok(Object.values(P).some((p) => /every bundle your group's Civicsmith holds/.test(p)));
  assert.match(U.GLOSSARY.SSHSIG, /^OpenSSH's signature format\. Civicsmith's releases are signed with it/);
});

test("DEC-149: the queue's levels say what nothing in your group's Civicsmith raises or looks at", () => {
  assert.match(U.notifClassLine("CONDITION", ["CONDITION"], {}, true),
    /— nothing in your group's Civicsmith raises one of these yet\./);
  assert.ok(PAGE.includes("nothing in your group\\'s Civicsmith looks yet"));
});

test("DEC-149: the sentences composed inside the page's render paths, as served", () => {
  const now = [
    `"adopt it for your group or for a project"`,
    `meaning:"The live source is re-checked on a schedule, and drift is flagged."`,
    `why:"Your group's Civicsmith returned no manifest for the completed capture."`,
    "it was never a question your group's Civicsmith could answer.",
    `|| "Your group's Civicsmith refused.")`,
    `<p class="dz-rlede">Your group's Civicsmith recorded the act.`,
    "in your group&rsquo;s Civicsmith&rsquo;s own words, not hidden.",
    `title="Your group's Civicsmith would refuse a signature from this key right now."`,
    "<b>This op is not on your group's Civicsmith.</b>",
    "the read this needs is not registered on your group's Civicsmith.",
    "asking again asks the same Civicsmith the same question.",
    `The reason your group's Civicsmith gave: <span class="q-feed-why">\${esc(st.why||"none")}`,
    "is missing from your group's Civicsmith, or has not answered yet",
    `|| "Your group's Civicsmith did not accept that."`,
    `title:"Your group's Civicsmith can store evidence"`,
    `|| "Your group's Civicsmith refused, and stored nothing."`,
    "<b>What gets recorded.</b> Your group's Civicsmith\n        fetches what the address serves",
    "Give an address and your group's Civicsmith fetches it,",
  ];
  for (const s of now) assert.ok(PAGE.includes(s), s);
  const gone = ["adopt it for this instance", "The plane re-checks the live source", "The plane returned no manifest",
    "a question this plane could answer", `"The plane refused."`, "The plane recorded the act.", "the plane&rsquo;s own words",
    "This instance would refuse a signature", "This op is not on this plane.", "the plane this instance talks to",
    "the plane gave none", "is missing from this plane", "The plane did not accept that.", "This instance can store evidence",
    "The plane refused, and stored nothing.", "<b>What gets recorded.</b> The plane", "the plane fetches it",
    "Could not reach the plane", "nothing on this plane raises", "nothing on this plane looks"];
  for (const s of gone) assert.ok(!PAGE.includes(s), s);
});

test("DEC-149 keeps a review copy's own name: 'this copy' of a review stays", () => {
  assert.ok(PAGE.includes("Export this copy to a file") && PAGE.includes("Back to the copy</button>"));
});
