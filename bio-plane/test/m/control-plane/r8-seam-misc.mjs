/* control-plane (fix round 8, K4427; R-SEAM, R-ONE, R-CLOCK, R-NOLOAD): THE SEAM FILE'S MISCELLANY. Three groups of the round's through-the-door tests, a member's own acts through the
   real plane under Miniflare, every input made by the acts and never a hand-written answer shape. `sections(kit, counting)` registers them: `kit` is a plain plane kit, `counting` a
   kit made with `makeKit({counting: true})` (its answers carry `x-wrap-calls`). They are written first and stay red by name until their providers have merged:
     F  (G112)       case-authoring: a prepared edition's pre-flight, sent as a reload sends it (no `tieAttested`), still offers a publishing time;
     C  (G101)       calculations: a comma CSV of the walker's size is declared from its bytes, as its tab twin is;
     Q  (G115/G116)  record-core (the write counter that skips the bookkeeping) and queue (one derivation per viewer and signature, the `queue-count` mark): the Queue count through the door.
   R-CLOCK: no duration the object measured is asserted; the Queue's recomputes are counted by the `Server-Timing` mark `queue-count;desc=hit|miss`, which the object states, and the
   waits are the test's own polls. R-NOLOAD: work (counts, rows, states) is asserted, never a time; the 5 s bucket of the count's key is allowed for by the instants the case's own wall crossed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import * as CE from "../screens-publish/fixtures.mjs";

const FIELDS = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const HEADER = FIELDS.map((f) => f.name);
const ROLES = { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } };
const CEREMONY = `/app/ceremony/${CE.P}/${CE.DR}`;
const BUCKET_MS = 5000; /* queue's QUEUE_COUNT_BUCKET_MS (src/queue/index.mjs), the width of the count key's clock bucket */

export function sections(kit, counting) {
  const { R } = kit;

  /* ======================================== F · G112 ======================================== */

  /* the edition is made once for the group (a member's whole chain of acts is the slow part); the control's unprepared draft is its own */
  let preparedOnce = null;
  const prepared = () => (preparedOnce ??= (async () => { await kit.profileSet(["oakland-alameda"]); return kit.preparedEdition("r8f-cy", "r8fa", { vouch: false }); })());

  test("R8 (F): the Sign step of a prepared edition still offers a publishing time when the pre-flight is sent without `tieAttested`, as a reload sends it", { timeout: 900000 }, async () => {
    const e = await prepared();
    const asked = await kit.ceremonyPreflight(e, { tied: false });
    const step = kit.signStepOf(asked);
    assert.ok("publish_at" in step, "the Sign step is in the answer: " + JSON.stringify(R(asked).steps).slice(0, 600));
    assert.notEqual(R(asked).first && R(asked).first.reason, "TIE_ATTESTATION_MISSING",
      "the draft's edition is prepared, so the ties were attested then and the pre-flight does not ask them again: " + JSON.stringify(R(asked).first).slice(0, 300));
    assert.ok(step.publish_at, `the Sign step states a publishing time (null is the signing check not reached over a prepared edition): ${JSON.stringify(step.publish_at_stated || null).slice(0, 200)}`);
    assert.equal(step.publish_at.offered, true, JSON.stringify(step.publish_at));
    assert.equal(step.publish_at.zone, "America/Los_Angeles", JSON.stringify(step.publish_at));
  });

  test("R8 (F control): an unprepared draft pre-flighted without `tieAttested` still answers `TIE_ATTESTATION_MISSING` and its Sign step's `publish_at` is null", { timeout: 900000 }, async () => {
    await kit.profileSet(["oakland-alameda"]);
    const e = await kit.preparedEdition("r8f-dee", "r8fb", { vouch: false, prepare: false });
    const asked = await kit.ceremonyPreflight(e, { tied: false });
    assert.equal(R(asked).first && R(asked).first.reason, "TIE_ATTESTATION_MISSING", JSON.stringify(R(asked).first).slice(0, 300));
    const step = kit.signStepOf(asked);
    assert.equal(step.publish_at, null, JSON.stringify(step).slice(0, 400));
  });

  test("R8 (F screen): the Ceremony over a prepared edition, given the door's own answer to the reload read, draws the date and time fields and no `data-publish-at-none`", { timeout: 900000 }, async () => {
    const e = await prepared();
    const asked = await kit.ceremonyPreflight(e, { tied: false });
    const p = await CE.open(CEREMONY, { plane: { publishpreflight: CE.ok(R(asked)) } });
    CE.tick(p, "ce-tie", "yes");
    await CE.press(p, "publish", { reason: "because" });
    const main = CE.main(p);
    const none = main.querySelector("[data-publish-at-none]");
    /* a boolean, never the element itself: a failed deepEqual would print the whole document */
    assert.ok(none === null, "the Sign step draws no 'no publishing time' note, but draws one of kind " + (none ? none.getAttribute("data-publish-at-none") : ""));
    assert.ok(p.doc.getElementById("ce-date") && p.doc.getElementById("ce-time"), "the Sign step draws the date and the time fields");
  });

  /* ======================================== C · G101 ======================================== */

  /* a CSV of `rows` data rows under the declared header in the delimiter `sep`, made distinct by `tag` (the round-7 seam's csvOf) */
  const csvOf = (rows, tag, sep = ",") => {
    const lines = [HEADER.join(sep)];
    for (let i = 0; i < rows; i++) lines.push([`P${tag}${String(i).padStart(6, "0")}`, "P002", (i % 97) + 1].join(sep));
    return kit.te(lines.join("\n") + "\n");
  };
  /* the member's upload as the screen presses it, then the table declared from the filed document as the screen declares it */
  async function declareFile(auth, bytes, name) {
    const res = await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=text%2Fcsv`, { method: "POST", headers: auth, body: bytes });
    const up = (await res.json()).result;
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
    const made = await CAPTURE_SCREEN.parts.promoteDocument(kit.screenCall(auth), { doc: up.document, title: name, locator: up.document.locator, project: "" });
    assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 400));
    const bundleId = made.bundleId || (made.result && made.result.bundleId) || up.document.bundleId;
    assert.ok(bundleId, "the document's bundle: " + JSON.stringify(made).slice(0, 300));
    const minted = await kit.post(auth, "contentmint", { bundleId });
    const contentId = minted.body.result && (minted.body.result.id || minted.body.result.content_id || minted.body.result.contentId);
    assert.ok(contentId, "content minted: " + JSON.stringify(minted.body).slice(0, 400));
    const declared = await kit.post(auth, "tabledeclare", { source: contentId, schema: { fields: FIELDS }, header: HEADER, roles: ROLES });
    return declared.body.result || declared.body;
  }

  test("R8 (C): a comma CSV of the walker's size is declared from its bytes: rows 18,098, no undetermined cell, and the tab twin has the same table sha", { timeout: 900000 }, async () => {
    const ann = await kit.person("r8c-ann");
    const ROWS = 18098;
    const tab = await declareFile(ann, csvOf(ROWS, "R8C", "\t"), "r8c.tsv");
    const comma = await declareFile(ann, csvOf(ROWS, "R8C", ","), "r8c.csv");
    const facts = `comma: rows ${comma.rows}, undetermined ${comma.undetermined && comma.undetermined.count}, sha ${String(comma.sha).slice(0, 12)}; tab: rows ${tab.rows}, undetermined ${tab.undetermined && tab.undetermined.count}, sha ${String(tab.sha).slice(0, 12)}`;
    assert.equal(comma.ok, true, "the comma file is declared: " + JSON.stringify(comma).slice(0, 400));
    assert.equal(tab.ok, true, "the tab file is declared: " + JSON.stringify(tab).slice(0, 400));
    assert.equal(comma.rows, ROWS, `the comma file's table holds its ${ROWS} data rows, not the index's (the walker's was 18,100): ${facts}`);
    assert.equal(comma.undetermined.count, 0, `no cell reads the header text as data (the walker's: 2, at the reading's windows): ${facts}; first ${String(JSON.stringify(comma.undetermined.cells && comma.undetermined.cells[0])).slice(0, 200)}`);
    assert.equal(tab.rows, ROWS, `the tab file's table holds its ${ROWS} data rows: ${facts}`);
    assert.equal(tab.undetermined.count, 0, `no cell reads the header text as data in the tab table: ${facts}`);
    assert.equal(comma.sha, tab.sha, `the same rows declared from the comma file and from the tab file are the one table: ${facts}`);
  });

  /* ======================================== Q · G115 / G116 ======================================== */

  /* the mark G116 adds to `Server-Timing`: `queue-count;desc=hit|miss` (null when absent), and the `rows-queue` entry of a recompute */
  const timing = (res) => res.headers.get("server-timing") || "";
  const markOf = (res) => { const m = /(?:^|,)\s*queue-count\s*;\s*desc\s*=\s*"?(hit|miss)"?/i.exec(timing(res)); return m ? m[1].toLowerCase() : null; };
  const hasRows = (res) => /(?:^|,)\s*rows-queue\s*(;|,|$)/.test(timing(res));
  const NO_MARK = (n) => `the \`queue-count;desc=hit|miss\` mark is absent from ${n} of the answers (G116 adds it; red until queue has merged)`;
  /* one call through the counting door, as the walker sends it: a foreground read of the member's own session */
  async function ask(auth, query) {
    const res = await counting.plane(`/api/?${new URLSearchParams(query)}`, { headers: auth });
    const body = await res.json();
    return { status: res.status, body, res, mark: markOf(res), rows: hasRows(res) };
  }
  const COUNT = { op: "queue", count: "true" };
  const countOf = (a) => { assert.equal(a.status, 200, JSON.stringify(a.body).slice(0, 300)); return R(a.body).count; };
  /* the 5 s boundaries a case's own wall crossed (R-NOLOAD): the key's bucket may move that many times, and the instants are the test's own, with a margin for the object's clock */
  const crossed = (from, to) => Math.floor((to + 100) / BUCKET_MS) - Math.floor((from - 100) / BUCKET_MS);
  const missesOf = (answers) => answers.filter((a) => a.mark === "miss").length;
  const marked = (answers) => {
    const absent = answers.filter((a) => a.mark === null).length;
    assert.equal(absent, 0, NO_MARK(`${absent}/${answers.length}`));
  };
  /* a real member of the owners' kind with `tasks` to-dos made by her own acts: she asks a check of herself on a project of hers, and each request is a task in her Queue */
  async function viewerWith(handle, tasks = 2) {
    const { auth } = await counting.ownerOf(handle);
    const project = await counting.projectOf(auth, `Count ${handle} project`);
    for (let i = 0; i < tasks; i++) {
      const r = await counting.post(auth, "checkrequest", { target: project, member: handle, note: `check ${i}` });
      assert.equal(R(r.body).ok, true, "a check is asked: " + JSON.stringify(r.body).slice(0, 300));
    }
    const first = await ask(auth, { op: "queue" });
    assert.equal(R(first.body).items.length, tasks, "her Queue holds her tasks: " + JSON.stringify(R(first.body).items.map((i) => i.id)));
    return auth;
  }

  test("R8 (G115/G116): twelve sequential `op=queue&count=true` as the walker sends them (no `background=1`) recompute at most once, the clock bucket allowed for", { timeout: 900000 }, async () => {
    const auth = await viewerWith("r8q-one");
    const t0 = Date.now();
    const answers = [];
    for (let i = 0; i < 12; i++) answers.push(await ask(auth, COUNT));
    const t1 = Date.now();
    for (const a of answers) assert.equal(countOf(a), 2, "every count is right");
    marked(answers);
    const allowed = 1 + crossed(t0, t1);
    assert.ok(missesOf(answers) <= allowed, `12 sequential counts recomputed ${missesOf(answers)} times (marks ${answers.map((a) => a.mark).join(",")}); at most ${allowed} (1 + ${crossed(t0, t1)} bucket boundaries crossed): a foreground read's own session write moves the count's key`);
  });

  test("R8 (G115/G116): twelve counts staggered 8 ms apart recompute at most once, the clock bucket allowed for", { timeout: 900000 }, async () => {
    const auth = await viewerWith("r8q-two");
    const t0 = Date.now();
    const answers = await Promise.all(Array.from({ length: 12 }, async (_, i) => { await kit.later(i * 8); return ask(auth, COUNT); }));
    const t1 = Date.now();
    for (const a of answers) assert.equal(countOf(a), 2, "every count is right");
    marked(answers);
    const allowed = 1 + crossed(t0, t1);
    assert.ok(missesOf(answers) <= allowed, `12 staggered counts recomputed ${missesOf(answers)} times (marks ${answers.map((a) => a.mark).join(",")}); at most ${allowed} (1 + ${crossed(t0, t1)} bucket boundaries crossed)`);
  });

  test("R8 (G115/G116): a screen's wave (six foreground reads, the list, then two background counts) is one derivation in all, and the count is the list's length", { timeout: 900000 }, async () => {
    const auth = await viewerWith("r8q-three");
    const t0 = Date.now();
    for (const op of ["whoami", "projectlist", "bootstrap", "infolevel", "groupidentity", "memberlist"]) {
      const r = await ask(auth, { op });
      assert.equal(r.status, 200, `the wave's read ${op}: ${JSON.stringify(r.body).slice(0, 200)}`);
    }
    const list = await ask(auth, { op: "queue" });
    const counts = [await ask(auth, { ...COUNT, background: "1" }), await ask(auth, { ...COUNT, background: "1" })];
    const t1 = Date.now();
    const items = R(list.body).items;
    assert.equal(items.length, 2, "the list holds her two tasks");
    for (const c of counts) assert.equal(countOf(c), items.length, "the count is the list's length");
    /* the list's own mark counts as a derivation when it states one; a list that states none is taken to have derived (it is the first read of the wave) */
    marked(counts);
    const derivations = (list.mark === "hit" ? 0 : 1) + missesOf(counts);
    const allowed = 1 + crossed(t0, t1);
    assert.ok(derivations <= allowed, `the wave derived the feed ${derivations} times (list ${list.mark}, counts ${counts.map((c) => c.mark).join(",")}); at most ${allowed} (1 + ${crossed(t0, t1)} bucket boundaries crossed)`);
  });

  test("R8 (G115/G116): a recompute states its mark `miss` with the `rows-queue` entry, and a background count asked at once after it states `hit`", { timeout: 900000 }, async () => {
    const auth = await viewerWith("r8q-four");
    /* her list was just derived (viewerWith read it): a count at the same signature is that derivation's (R94), a hit; a to-do made since moves the signature, so the count is a recompute */
    const shared = await ask(auth, COUNT);
    assert.equal(countOf(shared), 2);
    if (shared.mark !== null) assert.equal(shared.mark, "hit", "the count at the list's own signature is served from the list's derivation");
    const project = R((await ask(auth, { op: "projectlist" })).body).projects?.[0]?.id ?? R((await ask(auth, { op: "projectlist" })).body).items?.[0]?.id;
    const made = await counting.post(auth, "checkrequest", { target: project, member: "r8q-four", note: "check three" });
    assert.equal(R(made.body).ok, true, "a third check is asked: " + JSON.stringify(made.body).slice(0, 300));
    const first = await ask(auth, COUNT);
    assert.equal(countOf(first), 3);
    assert.equal(first.mark, "miss", `a member's count after a to-do was made is a recompute: mark ${first.mark} (${NO_MARK("this one")})`);
    assert.equal(first.rows, true, "a recompute carries the `rows-queue` entry: " + timing(first.res).slice(0, 300));
    const again = await ask(auth, { ...COUNT, background: "1" });
    assert.equal(countOf(again), 3);
    assert.equal(again.mark, "hit", `a background count writes nothing, so it is served from the count just made: mark ${again.mark}`);
  });

  /* the invalidation controls (green before and after): every producer's write must move the next count, and the count must be right. The mark is asserted `miss` where the object states one. */
  const recomputedAndRight = (a, want, what) => {
    assert.equal(countOf(a), want, `after ${what} the next count is right: ${JSON.stringify(a.body).slice(0, 200)}`);
    if (a.mark !== null) assert.equal(a.mark, "miss", `after ${what} the next count recomputes`);
  };

  test("R8 (G115/G116 control): after a task is resolved the next count recomputes and is right", { timeout: 900000 }, async () => {
    const auth = await viewerWith("r8q-five", 3);
    await ask(auth, COUNT); await ask(auth, { ...COUNT, background: "1" });
    const list = R((await ask(auth, { op: "queue" })).body).items;
    assert.equal(list.length, 3);
    const done = await counting.post(auth, "taskresolve", { id: list[0].id });
    assert.equal(R(done.body).ok, true, "the task is resolved: " + JSON.stringify(done.body).slice(0, 400));
    const next = await ask(auth, { ...COUNT, background: "1" });
    recomputedAndRight(next, 2, "a task resolve");
    assert.equal(R((await ask(auth, { op: "queue" })).body).items.length, 2, "the list agrees");
  });

  test("R8 (G115/G116 control): after a mute and after a new notice the next count recomputes and is right", { timeout: 900000 }, async () => {
    const adm = await counting.founder();
    const exportOnce = async (note) => {
      const ex = await counting.post(adm, "export", { note });
      assert.equal(R(ex.body).ok, true, "an export is performed (the administrators are told, queue-producers): " + JSON.stringify(ex.body).slice(0, 300));
    };
    const lengthOf = async () => R((await ask(adm, { op: "queue" })).body).items.length;
    const base = await lengthOf();
    await exportOnce("r8 count one");
    const noticed = await ask(adm, { ...COUNT, background: "1" });
    recomputedAndRight(noticed, base + 1, "a new notice");
    await ask(adm, { ...COUNT, background: "1" }); /* settled: asked again, still right */
    const items = R((await ask(adm, { op: "queue" })).body).items;
    const notice = items.find((i) => i.kind === "export-performed");
    assert.ok(notice, "the notice is in the list: " + JSON.stringify(items.map((i) => i.id)));
    const muted = await counting.post(adm, "queuemute", { item: notice.id });
    assert.equal(R(muted.body).ok, true, "the notice is quieted: " + JSON.stringify(muted.body).slice(0, 400));
    recomputedAndRight(await ask(adm, { ...COUNT, background: "1" }), base, "a mute");
    assert.equal(await lengthOf(), base, "the list agrees");
    await exportOnce("r8 count two");
    recomputedAndRight(await ask(adm, { ...COUNT, background: "1" }), base + 1, "a second new notice");
  });
}
