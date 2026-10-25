/* screens-investigate R4: a money trail, on interface-shell's served page over `store-request`'s world. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { inWorld, openAs, settled, refused, rewrite } from "./world.mjs";
import { main, actsIn, button, fill, press, word, drew, notDrew, dayOf } from "./fixtures.mjs";

const rowOf = (p, key) => main(p).querySelectorAll("tr.cs-r").find((r) => r.querySelector(`[data-id="${key}"]`));
const panelOf = (p, key) => { const r = rowOf(p, key); return r && r.nextElementSibling; };
const openPanel = async (p, key) => { await p.click(rowOf(p, key).querySelector('[data-shell="row"]')); return panelOf(p, key); };

/* ---- over `store-request`'s world (K5054): the real store behind the page's door, a real sign-in. The trail, its figures, the held files, the contract and its award are
   made by the member's own acts; every value a test asserts is read back from the world's answers. ---- */
const REASON = "The document says so.";
const TEXT = "The adopted budget moves 4,200,000 dollars from the Sewer Fund 3100 to the General Fund 1010 for 2021-22.";

/** A world with the Oakland profile active, a project, two held files, a trail started on it and three figures read from the first file: an adopted transfer
 *  (included, "the transfer we ask about"), the same transfer paid (included) and an allocation that names no payee (left out, "a different transfer"). */
async function moneyWorld() {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Pothole repairs");
  const lease = await world.recipes.hold(me, "Lease amendment 1", TEXT, project);
  const rent = await world.recipes.hold(me, "Rent schedule", "Monthly rent is due on the first.", project);
  const trail = await world.recipes.trail(me, project, "Stormwater fund transfers, FY2023");
  const source = { capture_sha: lease.sha, extent: { kind: "document" } };
  const read = async (o) => (await me.act("recordfact", { body: { currency: "USD", sign: "+", precision: "exact", period: { from: "2021-07-01", to: "2022-06-30" }, source, ...o } })).fact_id;
  /* the day the payment was made: a dated fact the ledger states, the event it dates, and the paid figure concerns that event */
  const day = (await me.act("recorddatedfact", { body: { captureSha: lease.sha, extent: { kind: "document" }, kind: "entered", value: "2022-06-30", method: "stated in the document" } })).dated_fact.dated_fact_id;
  const payment = (await me.act("createevent", { body: { kind: "other", attestations: [{ datedFactId: day }] } })).event_id;
  const F = {
    adopted: await read({ amount: "4200000.00", as_read: "4,200,000", kind: "transfer", phase: "adopted", basis: "budgetary", from: { as_written: "Sewer Fund 3100" }, to: { as_written: "General Fund 1010" } }),
    paid: await read({ concerns: [payment], amount: "4750000.00", as_read: "4,750,000", kind: "transfer", phase: "actual", stage: "paid", basis: "cash", from: { as_written: "Sewer Fund 3100" }, to: { as_written: "General Fund 1010" } }),
    other: await read({ amount: "310000.00", as_read: "310,000", kind: "allocation", phase: "actual", stage: "paid", basis: "undetermined", from: { as_written: "Sewer Fund 3100" } }),
  };
  /* the left-out figure is excluded without being proposed first: the store keeps an excluded proposal open (the todo below) */
  for (const id of [F.adopted, F.paid]) await me.act("moneysetpropose", { body: { setId: trail, factId: id, method: "member:recordfact" } });
  await me.act("include", { body: { setId: trail, factId: F.adopted, reason: "the transfer we ask about" } });
  await me.act("include", { body: { setId: trail, factId: F.paid, reason: "paid" } });
  await me.act("exclude", { body: { setId: trail, factId: F.other, reason: "a different transfer" } });
  return { world, me, project, lease, rent, trail, F, payment };
}
/** A question the project asks: an inquiry bundle promoted as the Explore screen promotes one. Answers its id. */
async function ask(world, me, title) {
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const id = (await me.read("allocid", { query: { prefix: "INQ", year: now.slice(0, 4) } })).id + "-seven-days";
  const lines = ["---", "id: " + id, "object_type: inquiry", "schema: inquiry@1", "title: " + JSON.stringify(title), "current_state: open", "prior_state: null", "created: " + now, "last_updated: " + now,
    "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "surfaced_by: human", "recheck_triggers:", "  - text: asked", "    description: asked", "---", ""];
  lines.push("## Question", "", title, "");
  await me.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_00000001", meta: { object_type: "inquiry", title, current_state: "open", created: now, last_updated: now },
    files: [{ path: "bundle.md", text: lines.join("\n") }] } });
  return id;
}
/** An answer of the world's with its result changed by `fn(result)`: a part of the world's own answer this build does not make (K5044 (1)). */
const changing = (world, me, op, fn) => rewrite(world, me, (req, a) => (a && a.json && a.json.result && req.url.includes("op=" + op)
  ? { ...a, json: { ...a.json, result: fn(a.json.result, req) } } : a));
const trailOf = (me, id) => me.read("moneyset", { query: { id } });

test("R4 reads the trail (moneyset) and each of its figures (moneyof's fact, by id): each a row with kind, from, to, when it moved, stage, period, amount, source grade and whether it is included, with its reason", async () => {
  const { world, me, trail, F, payment } = await moneyWorld();
  const p = await openAs(world, me, "/app/money/" + trail);
  assert.equal(p.byOp("moneyset")[0].query.id, trail);
  assert.deepEqual(p.byOp("money").map((r) => r.query.id).sort(), Object.values(F).sort());
  const heads = main(p).querySelectorAll("table.cs-rows thead th").map((h) => h.textContent).filter(Boolean);
  assert.deepEqual(heads, ["figure", "from", "to-where-it-went", "when-it-moved", "stage", "period", "amount", "source", "in-this-trail"].map((c) => word("column.money." + c + ".name")));
  const held = async (id) => (await me.read("money", { query: { id } })).fact;
  const a = await held(F.adopted), b = await held(F.paid);
  const r1 = rowOf(p, F.adopted).querySelectorAll("td").map((d) => d.textContent);
  const adopted = word("screen.money.phase.adopted");
  assert.ok(r1[1].startsWith(word("screen.money.kind." + a.kind)), "its kind");
  assert.deepEqual(r1.slice(2, 4), [a.from.as_written, a.to.as_written], "from and to, as the source writes them");
  assert.equal(r1[4], word("screen.money.didnotmove", { phase: adopted }));
  assert.equal(r1[5].trim(), word("screen.money.stage", { phase: adopted, stage: "" }).trim());
  assert.equal(r1[6], word("screen.money.period", { from: dayOf(a.period.from.slice(0, 10)), to: dayOf(a.period.to.slice(0, 10)) }));
  assert.equal(r1[7], word("screen.money.amount", { sign: "", amount: a.amount, currency: a.currency }));
  assert.ok(r1[8].startsWith("Lease amendment 1"), "the source, by its title");
  assert.ok(rowOf(p, F.adopted).querySelector('.cs-gap[data-gap="unrated"]'), "the store grades no upload: drawn unrated, never a grade the store did not give");
  assert.equal(r1[9], word("screen.money.included", { reason: "the transfer we ask about" }));
  const r2 = rowOf(p, F.paid).querySelectorAll("td").map((d) => d.textContent);
  const when = (await me.read("moneyset", { query: { id: trail } })).inclusions.find((x) => x.fact_id === F.paid).trail.moved;
  assert.equal(when.event, payment, "the figure is tied to the payment event");
  assert.ok(r2[4].startsWith(dayOf(when.when.value)), "when it moved: the event it is tied to, never its period");
  assert.ok(r2[5].includes(word("screen.money.stage", { phase: word("screen.money.phase.actual"), stage: word("screen.money.stage." + b.stage) })));
  drew(rowOf(p, F.other), "screen.money.excluded", { reason: "a different transfer" });
  assert.match(p.root().querySelector(".cs-crumbs").textContent, /Pothole repairs/);
  /* a grade and a fiscal year the live copy holds on a figure (a measured capture, a profile that names its fiscal year): this build makes neither, so the
     world's own answer is changed there and the rest is the world's */
  const graded = changing(world, me, "money", (r) => (r.fact && r.fact.fact_id === F.adopted
    ? { ...r, fact: { ...r.fact, grade: { ...r.fact.grade, reading: "B" }, period: { ...r.fact.period, fiscal: "FY2021-22" } } } : r));
  const q = await openAs(world, me, "/app/money/" + trail, { plane: { money: graded } });
  const g = rowOf(q, F.adopted).querySelectorAll("td").map((d) => d.textContent);
  assert.ok(g[8].endsWith(word("mark.scale.capture.name") + "B"), "the source and its grade");
  assert.equal(g[6], "FY2021-22", "the fiscal year, as the store names it");
});

test("R4 a value its source does not state is drawn undetermined and opens the row's panel at that item, with the evidence that would help", async () => {
  const { world, me, trail, F } = await moneyWorld();
  const p = await openAs(world, me, "/app/money/" + trail);
  const gap = rowOf(p, F.other).querySelector('td [data-shell="row"] .cs-gap[data-gap="undetermined"]');
  assert.ok(gap, "the allocation states no payee");
  await p.click(gap.closest("button"));
  const panel = panelOf(p, F.other);
  assert.equal(panel.hasAttribute("hidden"), false);
  drew(panel.querySelector('[data-gap-item="to"]'), "screen.money.evidence.to");
  assert.deepEqual(actsIn(panel).sort(), ["acquire", "actioncreate", "authoritychain", "checkrequest", "createevent", "findin", "gradenote", "hypothesishold", "include", "recordfact"].sort());
  assert.equal(rowOf(p, F.adopted).querySelector('.cs-gap[data-gap="undetermined"]'), null, "a figure stating everything carries no such mark (control)");
});

test("R4 a filter keeps only the rows with something undetermined (its address), and back", async () => {
  const { world, me, trail, F } = await moneyWorld();
  const p = await openAs(world, me, "/app/money/" + trail);
  const f = main(p).querySelector('a[href="/app/money/' + trail + '/undetermined"]');
  const rows = () => main(p).querySelectorAll("tr.cs-r").map((r) => r.querySelector("[data-id]").getAttribute("data-id"));
  assert.equal(f.textContent, word("screen.money.filter.gaps", { n: "1" }));
  await p.click(f);
  await p.settle();
  assert.deepEqual(rows(), [F.other]);
  assert.ok(main(p).querySelector(`a[href="/app/money/${trail}"]`));
});

/* REPORTED to the money module (moneyset): `exclude` does not close the figure's open proposal as `include` does (src/money/index.mjs, the `act === "include"` test), so a
   figure proposed to the trail and then left out is listed by `moneyset` in both `proposals` and `exclusions`, and the page draws it as two rows. */
test.todo("REPORTED: a figure proposed and then excluded is one row of the trail, not two", async () => {
  const { world, me, trail, F } = await moneyWorld();
  await me.act("moneysetpropose", { body: { setId: trail, factId: F.other, method: "member:recordfact" } });
  const held = await trailOf(me, trail);
  assert.equal(held.proposals.filter((x) => x.fact_id === F.other).length, 0, "the excluded figure is no longer an open proposal");
  const p = await openAs(world, me, "/app/money/" + trail);
  assert.equal(main(p).querySelectorAll("tr.cs-r").filter((r) => r.querySelector(`[data-id="${F.other}"]`)).length, 1);
});

test("R4 each row's panel by its kind: reconcile (a budgeted figure beside a paid one), authoritychain, include/exclude with a reason, gradenote, acquire, findin, recordfact, actioncreate, createevent, checkrequest, hypothesishold", async () => {
  const { world, me, project, lease, trail, F } = await moneyWorld();
  const inquiry = await ask(world, me, "Is the city repairing reported potholes within seven days?");
  /* `acquire` fetches an address on the web: an externally driven answer, the one line kept scripted (K5044 (1)) */
  const p = await openAs(world, me, "/app/money/" + trail, { plane: { acquire: ok({ ok: true }) } });
  let panel = await openPanel(p, F.adopted);
  fill(p, { ["money-with-" + F.adopted]: F.paid });
  await press(p, "reconcile", { within: panel });
  assert.deepEqual([p.byOp("reconcile")[0].query.a, p.byOp("reconcile")[0].query.b], [F.adopted, F.paid]);
  const rec = await me.read("reconcile", { query: { a: F.adopted, b: F.paid } });
  assert.equal(rec.consistent, false, "the store finds the budgeted figure and the paid one differ");
  panel = panelOf(p, F.adopted);
  drew(panel, "screen.money.rec.differs", { dims: rec.differs.map((x) => x.dimension).join(", ") });
  await press(p, "authoritychain", { within: panel });
  assert.equal(p.byOp("authoritychain")[0].query.id, F.adopted);
  const chain = await me.read("authoritychain", { query: { id: F.adopted } });
  assert.deepEqual(chain.chains, [], "the figure concerns no event: the store reads no chain of authority");
  drew(panelOf(p, F.adopted), "screen.money.auth.none");
  await press(p, "exclude", { within: panelOf(p, F.adopted), reason: "a budget figure, not a payment" });
  assert.deepEqual(p.byOp("exclude")[0].body, { setId: trail, factId: F.adopted, reason: "a budget figure, not a payment" });
  const left = (await trailOf(me, trail)).exclusions.find((x) => x.fact_id === F.adopted);
  assert.equal(left.reason, "a budget figure, not a payment", "the store holds the trail without it, with her reason");
  panel = await openPanel(p, F.paid);
  await press(p, "gradenote", { within: panel });
  assert.equal(p.byOp("gradenote")[0].query.capture, lease.sha);
  const grade = await me.read("gradenote", { query: { capture: lease.sha } });
  assert.ok(panelOf(p, F.paid).textContent.includes(grade.note || word("screen.money.note.none")), "the grade note, as the capture holds it (or that it holds none)");
  fill(p, { "mf-address": "https://city.example/afr-2022.pdf" });
  await press(p, "acquire", { within: panelOf(p, F.paid) });
  assert.deepEqual(p.byOp("acquire")[0].body, { locator: "https://city.example/afr-2022.pdf" });
  fill(p, { "mf-expertise": "municipal budget" });
  await press(p, "checkrequest", { within: panelOf(p, F.paid), reason: "how was it read?" });
  const cr = p.byOp("checkrequest")[0].body;
  assert.deepEqual([cr.target, cr.label, cr.reason], [project, "municipal budget", "how was it read?"]);
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the store took the request");
  fill(p, { "mf-question": inquiry, "mf-hunch": "the Sewer Fund's share of citywide overhead" });
  await press(p, "hypothesishold", { within: panelOf(p, F.paid), reason: REASON });
  assert.deepEqual(p.byOp("hypothesishold")[0].body, { inquiry, kind: "flow", statement: "the Sewer Fund's share of citywide overhead", about: [F.paid] });
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the store held the hypothesis");
  panel = await openPanel(p, F.other);
  fill(p, { "mf-doc": lease.sha });
  await press(p, "createevent", { within: panelOf(p, F.other), reason: "the ledger dates it" });
  assert.deepEqual(p.byOp("createevent")[0].body.attestations, [{ captureSha: lease.sha, extent: { kind: "document" } }]);
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the store held the event");
  await press(p, "findin", { within: panelOf(p, F.other) });
  assert.equal(p.location.pathname, "/app/find-in/" + project);
});

test("R4 \"Ask the city for the record\" opens request for the project", async () => {
  const { world, me, project, trail, F } = await moneyWorld();
  const p = await openAs(world, me, "/app/money/" + trail);
  const panel = await openPanel(p, F.other);
  await press(p, "actioncreate", { within: panel, reason: "we need the cost-allocation plan" });
  assert.equal(p.location.pathname, "/app/request/" + project);
});

test("R4 the screen's own acts: Read a figure (recordfact), Start a money trail (createset, its name its words), committedagainstpaid", async () => {
  const { world, me, project, lease, trail, F } = await moneyWorld();
  /* a contract the record follows, its award (an event) and a committed and a paid figure about it: made by her acts */
  const contract = (await me.act("entitycreate", { body: { kind: "contract", label: "Stormwater lining contract", note: "The 2022 lining contract" } })).entity_id;
  const award = (await me.act("createevent", { body: { kind: "award", attestations: [{ captureSha: lease.sha, extent: { kind: "document" } }], participants: [{ entityId: contract, role: "subject", attestation: 0 }] } })).event_id;
  const source = { capture_sha: lease.sha, extent: { kind: "document" } };
  const figure = { currency: "USD", sign: "+", precision: "exact", phase: "actual", basis: "cash", period: { from: "2021-07-01", to: "2022-06-30" }, source };
  await me.act("recordfact", { body: { ...figure, amount: "1300000.00", as_read: "1,300,000", kind: "expenditure", stage: "encumbered", concerns: [award] } });
  await me.act("recordfact", { body: { ...figure, amount: "1250000.00", as_read: "1,250,000", kind: "payment", stage: "paid", concerns: [contract] } });
  const p = await openAs(world, me, "/app/money/" + trail);
  fill(p, { "mf-amount": "310000.00", "mf-asread": "Overhead allocation … 310,000", "mf-kind": "allocation", "mf-phase": "actual", "mf-stage": "paid", "mf-basis": "undetermined",
    "mf-from-date": "2021-07-01", "mf-to-date": "2022-06-30", "mf-payer": "Sewer Fund 3100", "mf-doc": lease.sha });
  await press(p, "recordfact", { el: main(p).querySelectorAll('button[data-act="recordfact"]')[0], reason: REASON });
  await settled(p);
  assert.deepEqual(p.byOp("recordfact")[0].body, { amount: "310000.00", as_read: "Overhead allocation … 310,000", currency: "USD", sign: "+", precision: "exact", kind: "allocation",
    phase: "actual", basis: "undetermined", period: { from: "2021-07-01", to: "2022-06-30" }, from: { as_written: "Sewer Fund 3100" }, to: null,
    source: { capture_sha: lease.sha, extent: { kind: "document" } }, stage: "paid" });
  const proposed = (await trailOf(me, trail)).proposals.filter((x) => !Object.values(F).includes(x.fact_id));
  assert.equal(proposed.length, 1, "the store holds the figure as a proposal to the open trail");
  assert.equal(p.byOp("moneysetpropose")[0].body.factId, proposed[0].fact_id, "C8: proposed to the open trail");
  assert.ok(rowOf(p, proposed[0].fact_id), "the new figure is a row, not yet in the trail");
  assert.equal((await me.read("money", { query: { id: proposed[0].fact_id } })).fact.amount, "310000.00", "and the store holds what she read");
  await press(p, "committedagainstpaid");
  assert.equal(p.byOp("committedagainstpaid")[0].query.contract, contract, "C57: the contract is chosen, not typed");
  const cap = await me.read("committedagainstpaid", { query: { contract } });
  drew(main(p), "screen.money.cap.diff", { committed: cap.committed.sum.value, paid: cap.paid.sum.value, difference: cap.difference.figure.value });
  fill(p, { "mf-label": "Overhead charges, FY2022" });
  await press(p, "createset");
  assert.deepEqual(p.byOp("createset")[0].body, { purpose: "trail", label: "Overhead charges, FY2022", concerns: project });
  const started = (await me.read("moneysets", { query: { concerns: project, purpose: "trail", limit: "500" } })).sets.find((x) => x.label === "Overhead charges, FY2022");
  assert.ok(started, "the store holds the new trail");
  assert.equal(p.location.pathname, "/app/money/" + started.set_id);
});

test("R4 Read a figure names its passage and amount (control: none sends nothing, the form kept)", async () => {
  const { world, me, trail } = await moneyWorld();
  const p = await openAs(world, me, "/app/money/" + trail);
  fill(p, { "mf-asread": "something" });
  await press(p, "recordfact", { el: main(p).querySelectorAll('button[data-act="recordfact"]')[0] });
  assert.equal(p.byOp("recordfact").length, 0);
  assert.equal(p.doc.getElementById("mf-asread").value, "something");
});

test("R4 picked rows bring the hold strip with include, exclude (one reason for all), reconcile (exactly two picked) and checkrequest", async () => {
  const { world, me, trail, F } = await moneyWorld();
  const p = await openAs(world, me, "/app/money/" + trail);
  const pick = async (k) => { const b = rowOf(p, k).querySelector('[data-shell="pick"]'); b.checked = true; p.fire(b, "change"); await p.click(b); await p.settle(); };
  await pick(F.adopted);
  let hold = main(p).querySelector(".cs-hold");
  assert.ok(hold);
  assert.deepEqual(actsIn(hold).sort(), ["checkrequest", "exclude", "include"]);
  await pick(F.other);
  hold = main(p).querySelector(".cs-hold");
  assert.deepEqual(actsIn(hold).sort(), ["checkrequest", "exclude", "include", "reconcile"]);
  await press(p, "include", { within: hold, reason: "both belong to the transfer" });
  await settled(p);
  assert.deepEqual(p.byOp("include").map((r) => [r.body.factId, r.body.reason]).sort(), [[F.adopted, "both belong to the transfer"], [F.other, "both belong to the transfer"]].sort());
  const held = await trailOf(me, trail);
  assert.deepEqual(held.inclusions.filter((x) => [F.adopted, F.other].includes(x.fact_id)).map((x) => [x.fact_id, x.reason]).sort(), [[F.adopted, "both belong to the transfer"], [F.other, "both belong to the transfer"]].sort(), "the store includes both, with the one reason");
  assert.equal(held.exclusions.length, 0, "the figure left out before is now in");
});

test("R4 two sources that disagree are both drawn, in tension, never one picked; a project with no trail offers only Start a money trail", async () => {
  const { world, me, trail, F } = await moneyWorld();
  const p = await openAs(world, me, "/app/money/" + trail);
  assert.ok(rowOf(p, F.adopted) && rowOf(p, F.paid), "the adopted and the paid figure, both drawn");
  drew(main(p), "screen.money.tension");
  const bare = await world.recipes.project(me, "Nothing started");
  const q = await openAs(world, me, "/app/money/" + bare);
  assert.equal(q.byOp("moneyset").length, 0);
  assert.deepEqual(actsIn(main(q)), ["createset"]);
});

test("R4 a refused act is drawn beside it, nothing else changed (control)", async () => {
  const { world, me, trail, F } = await moneyWorld();
  /* a fault the test injects on purpose: the act answers a refusal */
  const p = await openAs(world, me, "/app/money/" + trail, { plane: { exclude: refusedIn("NO_SUCH_SET", "There is no such trail.") } });
  const panel = await openPanel(p, F.adopted);
  await press(p, "exclude", { within: panel, reason: "x" });
  assert.ok(panelOf(p, F.adopted).textContent.includes(word("refusal.NO_SUCH_SET")), "the refusal by its words");
});

test("R34 the money trail's figure form chooses the document by title and sends its digest; no field asks for a fingerprint or a page number by itself", async () => {
  const { world, me, lease, rent, trail } = await moneyWorld();
  const p = await openAs(world, me, "/app/money/" + trail);
  const held = (await me.read("heldcaptures", { query: { limit: "200", state: "held_and_vouched", fields: "picker" } })).held;
  assert.deepEqual(held.map((h) => h.capture.sha256).sort(), [lease.sha, rent.sha].sort(), "the store holds the two files");
  const titled = (sha) => { const h = held.find((x) => x.capture.sha256 === sha); return h.title + " · " + dayOf(h.collected_since.slice(0, 10)); };
  assert.deepEqual(p.doc.getElementById("mf-doc").querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]).filter(([v]) => v).sort(),
    [[lease.sha, titled(lease.sha)], [rent.sha, titled(rent.sha)]].sort(), "each by its title (and the day it was collected), its value the digest");
  assert.ok(titled(lease.sha).startsWith("Lease amendment 1") && titled(rent.sha).startsWith("Rent schedule"));
  assert.equal(main(p).querySelectorAll("*").filter((e) => /^mf-(sha|page)$/.test(e.getAttribute("id") || "")).length, 0);
  /* a team that holds no document */
  const bare = await inWorld();
  const project = await bare.world.recipes.project(bare.me, "Nothing held");
  const empty = await bare.world.recipes.trail(bare.me, project, "No documents");
  const none = await openAs(bare.world, bare.me, "/app/money/" + empty);
  assert.equal(none.doc.getElementById("mf-doc"), null, "no document: the choice's empty state");
});

/* C8, N1 (fix round 3; R4, money R28): a project's money trails are read by what they concern and listed, newest first, so a trail
 * started there is found again after the page is reloaded. */
const linksOf = (p) => main(p).querySelectorAll('a[href^="/app/money/MSR-"]').map((a) => a.getAttribute("href"));

test("R4 C8 a project's four trails are listed newest first, each opening its own page; the read names the project and asks for trails", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Pothole repairs");
  const made = [];
  for (const label of ["Trail 1", "Trail 2", "Trail 3", "Trail 4"]) made.push({ id: await world.recipes.trail(me, project, label), label });
  const p = await openAs(world, me, "/app/money/" + project);
  const q = p.byOp("moneysets");
  assert.equal(q.length, 1, "one read of the project's trails");
  assert.equal(q[0].query.concerns, project);
  assert.equal(q[0].query.purpose, "trail");
  const newest = made.slice().reverse();
  assert.deepEqual((await me.read("moneysets", { query: { concerns: project, purpose: "trail", limit: "500" } })).sets.map((x) => x.set_id), newest.map((x) => x.id), "the store's order is newest first");
  assert.deepEqual(linksOf(p), newest.map((x) => "/app/money/" + x.id), "the owner's order, newest first");
  for (const x of made) assert.ok(main(p).textContent.includes(x.label), "each by its label");
  notDrew(main(p), "screen.money.notrail", {}, "the page does not say no trail is open");
  assert.ok(button(p, "createset"), "starting another is still offered");
});

test("R4 C8 the trail is found after a reload: a trail started here is listed by a fresh page over the same record", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Pothole repairs");
  const first = await openAs(world, me, "/app/money/" + project);
  fill(first, { "money-label": "Overhead charges" });
  await press(first, "createset", { reason: REASON });
  await settled(first);
  const [started] = (await me.read("moneysets", { query: { concerns: project, purpose: "trail", limit: "500" } })).sets;
  assert.equal(started.label, "Overhead charges", "the store holds the trail she started");
  const again = await openAs(world, me, "/app/money/" + project);
  assert.deepEqual(linksOf(again), ["/app/money/" + started.set_id]);
  assert.ok(main(again).textContent.includes("Overhead charges"));
});

test("R4 C8 control: a project with none says so and offers only Start a money trail; a refused read draws no list", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Pothole repairs");
  const none = await openAs(world, me, "/app/money/" + project);
  drew(main(none), "screen.money.notrail");
  assert.deepEqual(linksOf(none), []);
  assert.deepEqual(actsIn(main(none)), ["createset"]);
  /* the store refuses a read that names nothing the trails concern (NO_CONCERNS), but no address the page serves asks it so: the refusal stays a scripted fault */
  assert.equal((await refused(world, me, "moneysets", {})).reason, "NO_CONCERNS", "the store's own refusal of a read that names nothing");
  const refusedRead = await openAs(world, me, "/app/money/" + project, { plane: { moneysets: refusedIn("NO_CONCERNS", "Name what the trails concern.") } });
  assert.deepEqual(linksOf(refusedRead), []);
  notDrew(main(refusedRead), "screen.money.notrail");
});
