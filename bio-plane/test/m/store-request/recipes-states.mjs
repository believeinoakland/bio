/* store-request R19 (STORE-REQUEST #7, B18 START; SCREENS-INQUIRY #31 J44 "States the world cannot make"): recipes of the states a question's screens draw, each real acts through the world's door:
   readings in every state, a question whose connection axis is graded, two documents of one issuer. None inserts a row; a refused act throws, naming the op. */
import { question, page, openRun } from "./recipes.mjs";
import { hold } from "./door.mjs";

/** R19: a question holding readings in the four states a version has, by the real acts of its project's member (`as`): `conclude` with `reading` accepts one (`reading-N`, from the
 *  question's own legs; `withdrawconclusion` lets the next be made), `versionconsider` makes one considering, `versionreject` rejected, `versionrevert` suggested again, and `versioncurrent`
 *  names the first the current one. The question rests on one held page (its leg `supports`). Answers `{question, project, document, versions: {accepted, considering, rejected, suggested},
 *  current}`: each a version id (`reading-N`); `basisversions` reads them. */
export async function readings(world, as, projectId, { title = "Readings", text = "Is it so?" } = {}) {
  const doc = await page(world, as, `${title} source`, { paragraphs: ["The count was 412."], project: projectId });
  const q = await question(world, as, projectId, { title, text, legs: [{ target: doc.bundle, role: "supports", extent_kind: "doc-para", extent_para: 1 }], draw: true });
  const ids = [];
  for (const [i, words] of ["The count was 412.", "The count was about 400.", "The count is disputed.", "The count was not made."].entries()) {
    await as.act("conclude", { query: { target: q.id, project: projectId, reading: words, falsifier: `The ledger says otherwise (${i + 1}).` } });
    ids.push(`reading-${i + 1}`);
    await as.act("withdrawconclusion", { query: { target: q.id, project: projectId, reason: "to make the next reading" } });
  }
  const [accepted, considering, rejected, suggested] = ids;
  await as.act("conclude", { query: { target: q.id, project: projectId, reading: "The count was 412.", falsifier: "The ledger says otherwise (final)." } });
  await as.act("versionconsider", { query: { target: q.id, version: considering, reason: "we are weighing it" } });
  await as.act("versionreject", { query: { target: q.id, version: rejected, reason: "it overreaches" } });
  await as.act("versionreject", { query: { target: q.id, version: suggested, reason: "set aside once" } });
  await as.act("versionrevert", { query: { target: q.id, version: suggested } });
  return { question: q.id, project: projectId, document: doc.bundle, versions: { accepted, considering, rejected, suggested }, current: accepted };
}

/** R19: a reading suggested by the machine, under a run: the team's Claude account (`recipes.assistant`, the member reading its notice), a run opened by the member over the project
 *  (`airunopen`), a credential minted for the run's class that may `suggest` (`aicredentialmint`), and the credential's own `suggest` through the door (`token`, never her session). The
 *  reading is `suggested`, authored by the credential (`token:ai`), its `run` the run's id. Needs `storeWorld({ ai: true })` and an administrator `admin` (the account's setter) besides
 *  `as`. Answers `{question, project, document, run, version, suggested}`. */
export async function machineReading(world, admin, as, projectId, { title = "Machine reading", words = "The count was 412." } = {}) {
  if (!world.env.CIVICSMITH_TEST_INSTANCE)
    throw new Error("storeWorld: recipes.machineReading needs a run, and a run opens only on a test instance: make the world with storeWorld({ ai: true })");
  await world.recipes.assistant(admin, { readers: [as] });
  const doc = await page(world, as, `${title} source`, { paragraphs: ["The count was 412."], project: projectId });
  const q = await question(world, as, projectId, { title, text: "Is it so?", legs: [{ target: doc.bundle, role: "supports", extent_kind: "doc-para", extent_para: 1 }], draw: true });
  const run = await openRun(world, as, projectId);
  const minted = await as.act("aicredentialmint", { body: { tokenId: `reader-${run.slice(-4)}`, principalKind: "member", writes: ["suggest"] } });
  const answer = await world.door({ url: `/api/?${new URLSearchParams({ op: "suggest" })}`, init: { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ target: q.id, run, kind: "basis-version", name: "machine-reading", description: words, grounds: [{ ground: "paper", statement: "the paper trail" }],
      legs: [{ target: doc.bundle, role: "supports", ground: "paper" }] }) } }, { token: minted.token });
  const suggested = answer.json && answer.json.result !== undefined ? answer.json.result : answer.json;
  if (!suggested || suggested.ok !== true) throw new Error(`storeWorld: suggest was refused: ${JSON.stringify(answer.json).slice(0, 400)}`);
  return { question: q.id, project: projectId, document: doc.bundle, run, version: "machine-reading", suggested };
}

const NAMES = ["Jane Smith", "Raj Patel", "Maria Lopez", "Tom Chen", "Ana Diaz", "Lee Park"];
/** R19: a question whose connection axis is graded, by real acts: a staff directory held and read (a table of six people with their emails on one domain, so the reading's references are
 *  `contact:<email>`), a person entity whose alias is one email (`entitycreate`), `resolve` of the directory (the real resolution, grade B), and a question about that subject resting on the
 *  directory with its leg graded B on the connection axis by resolution. Answers `{question, project, subject, document, resolved, strength}` (`inquirystrength`'s answer: `connection`
 *  is `graded`, B; the capture axis stays unrated, an earned capture grade on a held page being refused UNDETERMINED). */
export async function graded(world, as, projectId, { title = "Subject", person = "Jane Smith" } = {}) {
  const html = `<html><head><title>Staff Directory</title></head><body><h1>Staff Directory</h1><table>${NAMES.map((n, i) => `<tr><td>${n}</td><td>${n.toLowerCase().replace(" ", ".")}@oaklandca.gov</td><td>510-238-${3000 + i}</td></tr>`).join("\n")}</table></body></html>`;
  const doc = await hold(world, as, `${title} directory`, html, projectId, { type: "text/html", read: true });
  const email = `${person.toLowerCase().replace(" ", ".")}@oaklandca.gov`;
  const subject = (await as.act("entitycreate", { body: { kind: "person", label: person, note: "A person the directory lists.", aliases: [email] } })).entity_id;
  const resolved = await as.act("resolve", { body: { captureSha: doc.sha } });
  const q = await question(world, as, projectId, { title, text: "Is it so?", subject, draw: true,
    legs: [{ target: doc.bundle, role: "supports", grade: "B", grade_axis: "connection", grade_source: "resolution" }] });
  return { question: q.id, project: projectId, subject, document: doc.bundle, resolved, strength: await as.read("inquirystrength", { query: { id: q.id, project: projectId } }) };
}

/** R19: two documents of one issuer, by real acts: two held pages, a public office (`entitycreate`) and an issuance event for each naming it the actor (`eventcreate`), and a question
 *  resting on both. `partitionindependence` over `[[0],[1]]` then says the two parts share the issuer. Answers `{question, project, documents: [a, b], office, independence}`. */
export async function sharedOrigin(world, as, projectId, { title = "Two sources" } = {}) {
  const a = await page(world, as, `${title} count`, { paragraphs: ["Potholes were counted at 412."], project: projectId });
  const b = await page(world, as, `${title} audit`, { paragraphs: ["The audit found 399 potholes."], project: projectId });
  const office = (await as.act("entitycreate", { body: { kind: "office", label: "Public Works", note: "The department that issued both documents." } })).entity_id;
  for (const d of [a, b]) await as.act("eventcreate", { body: { kind: "issuance", attestations: [{ captureSha: d.sha, extent: { kind: "doc-para", para: 1 } }], participants: [{ entityId: office, role: "actor", attestation: 0 }] } });
  const q = await question(world, as, projectId, { title, legs: [{ target: a.bundle }, { target: b.bundle }], draw: true });
  const independence = (await as.read("partitionindependence", { query: { id: q.id, partition: JSON.stringify([[0], [1]]) } })).independence;
  return { question: q.id, project: projectId, documents: [a.bundle, b.bundle], office, independence };
}
