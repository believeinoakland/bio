/* Where else to go (R15, R16) on the real served page (interface-shell's harness), against a fake plane answering
   `wizard-scripts` R37's shape (`startfrom`'s `elsewhere` route and its `pointer`) until `plane` R51 merges. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, ops, main } from "./page.mjs";

const P = (kind, name, extra = {}) => ({ kind, name, does: `What ${name} does.`, contacts: [{ how: "phone", value: "(510) 555-0100" }, { how: "web", value: "help.example.org/" + kind }],
  source: `${name}'s website`, status: "researched", basis: "2026-10-02", ...extra });
// A fixture holding every kind, in an order other than DEC-227's, two of one kind.
const EVERY = [P("tipline", "Ledger tips"), P("legalaid", "Legal Aid Line"), P("agency", "Civil Rights Department"), P("selfhelp", "Self-Help Center"),
  P("agency", "Labor Commissioner"), P("representative", "District 3 office"), P("service", "Town 311")];
const door = (pointer) => ok({ ok: true, scripts: [], doors: [{ door: "elsewhere", scripts: [], opens: "elsewhere" }], routes: [{ route: "project" }, { route: "elsewhere", pointer }] });
const heads = (p) => main(p).querySelectorAll("section > h2").map((h) => h.textContent);

test("R15: elsewhere reads startfrom and draws, under its heading, each kind holding a pointer in DEC-227's order, each pointer with what it does, how to reach it and its source with the date read", async () => {
  const p = await open("/app/elsewhere", { startfrom: door({ places: ["River Town"], pointers: EVERY }) });
  assert.equal(p.byOp("startfrom").length, 1);
  assert.equal(main(p).querySelector("h1").textContent, "Where else to go");
  assert.match(text(p), /Civicsmith is for a group checking whether its government keeps its word\..*Opening this page records nothing, and nobody in your group is told\./);
  assert.deepEqual(heads(p), ["Legal help you can afford", "The courts' own self-help", "The city's service line", "A state agency for your kind of problem",
    "Your elected representative's office", "A newsroom that takes tips"]);
  // Each kind explained by its `_says` (interface-shell R14).
  assert.match(main(p).querySelector("section > h2").getAttribute("data-tip"), /Organizations that give legal advice/);
  const agency = main(p).querySelectorAll("section")[3];
  assert.deepEqual(agency.querySelectorAll(".cs-row b").map((b) => b.textContent), ["Civil Rights Department", "Labor Commissioner"], "the profile's order within a kind");
  assert.match(text(p, agency), /Civil Rights DepartmentWhat Civil Rights Department does\.phone \(510\) 555-0100 · web help\.example\.org\/agencyFrom Civil Rights Department's website, read 2 October 2026/);
  // A web value is an outside link.
  const web = agency.querySelector("a[target=_blank]");
  assert.equal(web.getAttribute("href"), "https://help.example.org/agency");
  assert.equal(web.getAttribute("rel"), "noopener noreferrer");
  // Back to Home; no act.
  assert.equal(main(p).querySelectorAll('a[href="/app"]').at(-1).textContent, "Back to Home");
  assert.deepEqual(ops(p), []);
  assert.doesNotMatch(text(p), /If you are in danger now/, "the danger line is the none states'");
});

test("R15: control: a profile with one kind draws only that heading", async () => {
  const p = await open("/app/elsewhere", { startfrom: door({ places: ["River Town"], pointers: [P("service", "Town 311")] }) });
  assert.deepEqual(heads(p), ["The city's service line"]);
});

test("R15: with no place, \"Nothing listed yet\" and why; with places and no pointer, the places named; both draw the danger line", async () => {
  const none = await open("/app/elsewhere", { startfrom: door({ places: [], pointers: [] }) });
  assert.deepEqual(heads(none), ["Nothing listed yet"]);
  assert.match(text(none), /Your group follows no place's rules, so Civicsmith has no list to show\..*If you are in danger now, call your local emergency number\./);
  const empty = await open("/app/elsewhere", { startfrom: door({ places: ["River Town", "Lake County"], pointers: [] }) });
  assert.deepEqual(heads(empty), ["Nothing listed yet"]);
  assert.match(text(empty), /River Town, Lake County/);
  assert.match(text(empty), /If you are in danger now/);
  // A pointer of an unknown kind is no kind's: the places named.
  const odd = await open("/app/elsewhere", { startfrom: door({ places: ["River Town"], pointers: [P("other", "X")] }) });
  assert.deepEqual(heads(odd), ["Nothing listed yet"]);
});

test("R15 (interface-shell R10): a pointer of null, or a startfrom that fails, is drawn failed, never as none", async () => {
  for (const startfrom of [door(null), refused("STORE_DID_NOT_ANSWER", null, 502), ok({ ok: true, doors: [], routes: [] })]) {
    const p = await open("/app/elsewhere", { startfrom });
    assert.ok(main(p).querySelector('[data-state="failed"]'));
    assert.doesNotMatch(text(p), /Nothing listed yet/);
  }
});

test("R15: the record's data is drawn as data, HTML-escaped", async () => {
  const p = await open("/app/elsewhere", { startfrom: door({ places: ["River Town"], pointers: [P("service", "<b>Town</b> & 311", { does: "<img src=x onerror=alert(1)>", contacts: [{ how: "web", value: "javascript:alert(1)" }] })] }) });
  assert.match(text(p), /<b>Town<\/b> & 311/);
  assert.ok(!main(p).querySelector("img"));
  assert.equal(main(p).querySelectorAll("a[target=_blank]").length, 0, "a value that is no web address is no link");
});

test("R16: opening elsewhere records nothing and tells nobody: its only read is startfrom, beside the shell's own, and it sends no act and no wizardprogress", async () => {
  const p = await open("/app/elsewhere", { startfrom: door({ places: ["River Town"], pointers: EVERY }) });
  const SHELL = new Set(["whoami", "bootstrap", "interfacewords", "infolevel", "groupidentity", "assistantstate", "accountreference", "subscriptionsignin", "groupkeystate", "queue"]);
  const mine = [...new Set(p.requests.map((r) => r.op).filter((op) => !SHELL.has(op)))];
  assert.deepEqual(mine, ["startfrom"]);
  // The shell's own reachability read (`subscriptionsignin` `{step: "state"}`, interface-shell R20) aside, nothing but reads.
  assert.deepEqual(p.requests.filter((r) => r.method !== "GET" && !SHELL.has(r.op)).map((r) => r.op), [], "nothing sent but reads");
  assert.equal(p.byOp("wizardprogress").length, 0);
  assert.equal(p.byOp("lookedsince").length, 0, "no look recorded");
});
