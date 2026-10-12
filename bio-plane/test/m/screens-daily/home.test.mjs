/* The group's home (R1) at the module's interface: what it reads, what it draws in each state, and the one act it
   offers, over the stand-in kit (kit.mjs). */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-daily/index.mjs";
import { kit, viewOf, ops, drawn, keys, text } from "./kit.mjs";

const home = SCREENS.find((s) => s.id === "home");
const DATA = {
  group: { ok: true, group: "lakeshore", display_name: "Lakeshore Tenants", description: "Rents and leases on city land." },
  queue: {
    items: [
      { id: "TSK-1", class: "OBLIGATION", kind: "check", summary: "Vouch for 3 photos", due: "2026-10-12" },
      { id: "FINDING::a", class: "FINDING", kind: "source-modified", summary: "Two documents disagree" },
      { id: "CONDITION::b", class: "CONDITION", kind: "reply", summary: "A reply is due" },
    ],
    item_count: 9,
  },
  projects: { hits: [
    { bundle_id: "PROJ-1", title: "The Coliseum lease", current_state: "investigating" },
    { bundle_id: "PROJ-2", title: "Pothole repairs", current_state: "forming" },
    { bundle_id: "PROJ-3", title: "Odd", current_state: "paused" },
  ] },
  directory: { projects: [{ id: "PROJ-9", name: "Library hours", request: { state: "open" } }, { id: "PROJ-8", name: "Parks", request: null }] },
};

test("R1: Home reads queue (its first items), the projects the member may see, the projects they could join, and the public groupidentity", () => {
  const r = home.reads(viewOf());
  assert.deepEqual(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.op])), { group: "groupidentity", queue: "queue", projects: "search", directory: "projectdirectory" });
  assert.equal(r.queue.query.limit, "5");
  assert.equal(r.projects.query.q, "type:project");
  assert.equal(r.queue.empty({ items: [] }), true);
  assert.equal(r.queue.empty({ items: [{}] }), false);
  assert.equal(r.projects.empty({ hits: [] }), true);
  assert.equal(r.directory.empty({ projects: [] }), true);
});

test("R1: the heading is the group's name and its description; the queue's first items by kind mark, under \"Your queue (<n>)\"", () => {
  const k = kit();
  const html = k.render(home, viewOf({ data: DATA }));
  assert.match(html, /<h1>Lakeshore Tenants<\/h1>/);
  assert.match(text(html), /Rents and leases on city land\./);
  for (const m of ["kind.todo", "kind.noticed", "kind.status"]) assert.match(html, new RegExp(`data-mark="${m}"`));
  assert.match(html, /href="\/app\/queue">.*Your queue \(9\)/);
  assert.match(html, /data-iso="2026-10-12"/);
  assert.ok(keys(html).includes("screen.home.waiting"));
  // A group with no description says so in its words, never blank.
  const bare = kit().render(home, viewOf({ data: { ...DATA, group: { display_name: "Lakeshore Tenants" } } }));
  assert.ok(keys(bare).includes("screen.home.nodescription"));
});

test("R1: each project the member may see is a link to its screen with its stage ladder Forming, Investigating, Matured, Closed", () => {
  const html = kit().render(home, viewOf({ data: DATA }));
  assert.match(html, /href="\/app\/project\/PROJ-1">The Coliseum lease/);
  const ladders = [...html.matchAll(/<div class="cs-ladder"[^>]*>(.*?)<\/div>/g)].map((m) => m[1]);
  assert.equal(ladders.length, 3);
  const on = (l) => [...l.matchAll(/<span class="(on)?"/g)].map((m) => !!m[1]);
  assert.deepEqual(on(ladders[0]), [true, true, false, false]);
  assert.deepEqual(on(ladders[1]), [true, false, false, false]);
  assert.deepEqual(on(ladders[2]), [false, false, false, false], "an unknown stage draws no step on");
  assert.match(ladders[0], /aria-current="step">⟦screen.home.stage.investigating⟧Investigating/);
  for (const s of ["forming", "investigating", "matured", "closed"]) assert.ok(keys(ladders[0]).includes(`screen.home.stage.${s}`));
  assert.doesNotMatch(text(html), /\d+ questions?\b/, "no question count in T46 (K3000)");
});

test("R1: the projects the member could join are listed by name under their own heading, with no act", () => {
  const html = kit().render(home, viewOf({ data: DATA }));
  assert.ok(keys(html).includes("screen.home.couldjoin"));
  assert.match(html, /Library hours/);
  assert.ok(keys(html).includes("screen.home.joinasked"));
  const none = kit().render(home, viewOf({ data: { ...DATA, directory: { projects: [] } } }));
  assert.ok(!keys(none).includes("screen.home.couldjoin"));
  assert.deepEqual(ops(html), ["promote"]);
});

test("R1 (interface-shell R10): each read drawn in its four states: loading, empty in its own words, failed, data", () => {
  const st = (state) => ({ state, value: state === "ok" ? undefined : null, refusal: state === "failed" ? { code: "STORE_DID_NOT_ANSWER" } : null });
  const loading = kit().render(home, viewOf({ data: { group: st("loading"), queue: st("loading"), projects: st("loading"), directory: st("loading") } }));
  assert.equal((loading.match(/data-state="loading"/g) || []).length, 3);
  const empty = kit().render(home, viewOf({ data: { ...DATA, queue: st("empty"), projects: st("empty") } }));
  assert.ok(keys(empty).includes("screen.home.nothingwaiting"));
  assert.ok(keys(empty).includes("screen.home.noprojects"));
  const failed = kit().render(home, viewOf({ data: { ...DATA, queue: st("failed"), projects: st("failed") } }));
  assert.equal((failed.match(/data-state="failed"/g) || []).length, 2);
  assert.ok(!keys(failed).includes("screen.home.noprojects"), "a failed read is never drawn as empty");
});

test("R1: \"Start a project\" sends promote with the member's title as a new forming project, and opens project on success", () => {
  const k = kit({ values: { "home-title": "  Park bond oversight " } });
  const html = k.render(home, viewOf({ data: DATA }));
  assert.deepEqual(drawn(html)[0], ["promote", { label: "act.promote.label.home", tone: "primary" }]);
  const sent = k.send(home, "promote", viewOf());
  assert.equal(sent.body.base, null);
  assert.equal(sent.body.meta.object_type, "project");
  assert.equal(sent.body.meta.title, "Park bond oversight");
  assert.equal(sent.body.meta.current_state, "forming");
  assert.match(sent.body.snapKey, /^\d{8}T\d{6}Z_[0-9a-f]{8}$/);
  const md = sent.body.files[0];
  assert.equal(md.path, "bundle.md");
  assert.match(md.text, /^---\nobject_type: project\nobjective: "Park bond oversight"\ncurrent_state: forming\n/);
  assert.doesNotMatch(md.text, /^id:/m, "no id is sent: the project's id is minted (promotion R19)");
  assert.equal("owner" in sent.body || "author" in sent.body, false, "the owner is the door's stamp, never the page's");
  // A title with a quote or newline stays one YAML string.
  const odd = kit({ values: { "home-title": 'A "quoted"\ntitle' } }).send(home, "promote", viewOf());
  assert.match(odd.body.files[0].text, /objective: "A \\"quoted\\"\\ntitle"\n/);
  k.done(home, "promote", viewOf(), { ok: true, bundleId: "PROJ-77" });
  assert.deepEqual(k.log.go, [["project", "PROJ-77"]]);
});

test("R1: control: with no title nothing is sent and the member is told in the screen's words", () => {
  const k = kit({ values: { "home-title": "   " } });
  assert.deepEqual(k.send(home, "promote", viewOf()), { refuse: "screen.home.title.needed" });
  k.done(home, "promote", viewOf(), { ok: true });
  assert.deepEqual(k.log.go, [], "no project id, nothing opened");
});
