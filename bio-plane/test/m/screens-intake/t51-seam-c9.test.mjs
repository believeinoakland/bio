/* screens-intake T51 fix round 4, C9 R49: the seam owner's whole path over the real `capture` and its real store fixture (K4468; R-SEAM).
 * The member presses Capture on an address the team already holds, from a project's Add page (the pre-flight `held: true` path); the plane
 * this page talks to answers `heldat`, `captureseenin` and `heldcaptures` by running capture's own ops over capture's own tables. Only the
 * ops that are not capture's (`image`, `projectlist`, the frame) are scripted. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, main, fill, press, ok, says, DOCUMENT_STUB, MEMBER } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { captureOps } from "../../../src/capture/index.mjs";
import { fresh, network, receipt, register, sha } from "../capture/fixture.mjs";

const ADDRESS = "https://www.nps.gov/yose/index.htm";
const BODY = "Yosemite National Park, as first captured";
const DIGEST = sha(BODY);
const MINE = "PROJ-MINE", HOME = "PROJ-HOME", HOLDER = "INFO-2026-0083-yosemite";
const md = (title) => ["---", `title: ${JSON.stringify(title)}`, "---", "", "## Summary", ""].join("\n");
const anchors = (p, id) => Array.from(main(p).querySelectorAll("a")).filter((a) => String(a.getAttribute("href")).includes(id));

/* capture's store with: the member (`mai`, the page's signed-in member) in PROJ-MINE; HOLDER held under PROJ-HOME, which `mai` joins only
   when `sees` (the viewer who cannot see the home reads the address as not held, capture R96) */
function store({ sees }) {
  const f = fresh();
  for (const m of ["mai", "x"]) f.s.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  for (const p of [MINE, HOME]) f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES (?, 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`, p);
  const part = (p, m) => f.s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?, ?, 'joined', '2026-01-01', '2026-01-01')`, p, m);
  part(MINE, "mai"); part(HOME, "x"); if (sees) part(HOME, "mai");
  f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project) VALUES (?, 'information', 'g', 'Yosemite National Park', 'collected', '2026-02-01T00:00:00Z', '2026-02-01T00:00:00Z', 'x', 1, ?)`, HOLDER, HOME);
  register(f.s, DIGEST, HOLDER, { project: HOME });
  receipt(f.s, { address: ADDRESS, capture: DIGEST, first: "2026-02-01T10:00:00Z" });
  f.c.recordCaptureActor({ captureSha: DIGEST, actor: "x", at: "2026-02-01T10:00:00Z" });
  return f;
}

/* the page's plane: capture's own ops for the three it answers, the stamps the control plane sets (`by`, `viewer`) from the session */
function plane(f) {
  const run = (op) => async (req) => {
    const qs = new URLSearchParams({ op, ...Object.fromEntries(Object.entries(req.query).filter(([k]) => k !== "op")), by: "member:mai", viewer: "member:mai" });
    const out = await captureOps(f.c, new URL(`http://x/${op}?${qs}`), req.body === undefined ? null : req.body, f.c.env)[op]();
    return ok(out);
  };
  return {
    heldat: run("heldat"), captureseenin: run("captureseenin"), heldcaptures: run("heldcaptures"),
    image: (r) => ok(r.query.id === MINE ? { "bundle.md": md("Pothole repairs") } : r.query.id === HOME ? { "bundle.md": md("Housing repairs") } : null),
    projectlist: ok({ projects: [] }),
    /* what a capture would do if it were sent: the test fails on any acquire, the pre-flight found the address held */
    acquire: () => { throw new Error("acquire was sent"); },
  };
}
const press1 = async (p) => { fill(p, { "ci-address": ADDRESS }); await press(p, "acquire"); };
const asMai = (f) => captureOps(f.c, new URL(`http://x/heldcaptures?project=${MINE}&by=member:mai&viewer=member:mai`), null, f.c.env).heldcaptures();

test("R49 (C9, seam) the walker's address, already held under another project, pressed from the project's Add: capture's real heldcaptures then lists it for the project with also_here, and the page says it was filed here as well", async () => {
  const f = store({ sees: true });
  const net = network({ [ADDRESS]: () => new Response(BODY) });
  try {
    assert.deepEqual((await asMai(f)).held, [], "before: nothing is filed under the project (the walker's finding)");
    const p = await openPage(`/app/capture/address/${MINE}`, { plane: plane(f), screens: [...SCREENS, DOCUMENT_STUB], me: { ...MEMBER, member: "mai" } });
    await press1(p);
    assert.equal(p.byOp("acquire").length, 0);
    assert.equal(p.byOp("heldat")[0].query.check, "true");
    const after = await asMai(f);
    assert.deepEqual(after.held.map((r) => [r.bundle_id, r.also_here, r.project]), [[HOLDER, { home: HOME }, HOME]], "listed as seen here, its home unchanged");
    assert.ok(says(p, "screen.capture.address.filedhere", { project: "Housing repairs" }), "and the page says so");
    assert.equal(anchors(p, HOLDER).length, 1);
  } finally { net.restore(); }
});

test("R49 (C9, seam) control: a viewer who cannot see the home reads the address as not held; nothing is filed and the project's list stays empty", async () => {
  const f = store({ sees: false });
  const net = network({ [ADDRESS]: () => new Response(BODY) });
  try {
    const p = await openPage(`/app/capture/address/${MINE}`, { plane: { ...plane(f), acquire: ok({ ok: true, existed: true, document: { capture: { sha256: DIGEST, bytes: BODY.length }, file: "snapshots/a.htm", title: null } }),
      allocid: ok({ ok: true, id: "INFO-2026-0099" }), promote: ok({ ok: false, reason: "CAPTURE_HELD_BY_ANOTHER_BUNDLE", code: "CAPTURE_HELD_BY_ANOTHER_BUNDLE", holder: HOLDER }) },
      screens: [...SCREENS, DOCUMENT_STUB], me: { ...MEMBER, member: "mai" } });
    await press1(p);
    assert.equal(p.byOp("captureseenin").length, 0);
    assert.deepEqual((await asMai(f)).held, []);
    assert.ok(says(p, "refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE"), "the holder sentence");
  } finally { net.restore(); }
});
