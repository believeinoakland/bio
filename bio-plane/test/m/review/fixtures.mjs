/* The answers this module publishes for its users' tests (K4990, K4993, K4995): each is made by this module's real ops when
   the test calls it, over a world built that call (never stored, never written by hand). A user's test takes its value from
   here instead of building the answer by hand. Every answer is the op's own answer, as the door sends it (reviewOps). */
import { standard, P, V, SECRET } from "./fixture.mjs";
import { reviewOps } from "../../../src/review/index.mjs";
import { preflightAnswer } from "../case-authoring/fixtures.mjs";

const INQ = "INQ-2026-0001-c";
const QUESTION = "The Act requires a reply in 20 days.";
const FALSIFIER = "A court order saying otherwise.";
const SHARED = SECRET(1);

/* a world with one question the project has concluded (its conclusion in its front matter, the state `concluded`) */
function concludedWorld() {
  const w = standard();
  w.bundle(INQ, "inquiry", `---\nid: ${INQ}\nobject_type: inquiry\nconclusion: "${QUESTION}"\nfalsifier: "${FALSIFIER}"\n---\n\n## Question\n\nWhat does the Act require?\n`, "concluded");
  return w;
}
/* the op set as a door calls it, with the query the door would send */
const ops = (w, query, body) => reviewOps(w.r, new URL(`http://x/?${new URLSearchParams(query)}`), body);
const asMember = { author: "ann", viewer: V("ann") };

/* a draft over the concluded question, made by the casedraft op */
function draftOf(w) {
  const d = ops(w, asMember, { project: P, targets: [INQ] }).casedraft();
  if (d.ok !== true) throw new Error(`fixtures: the draft was refused: ${JSON.stringify(d).slice(0, 300)}`);
  return d;
}
/* a grant the reviewgrant op makes for the shared secret, so an outside reader holds the link */
function grantOf(w, draftId) {
  const g = ops(w, asMember, { draft: draftId, recipient: "Reader", secretSha: SHARED }).reviewgrant();
  if (g.ok !== true) throw new Error(`fixtures: the grant was refused: ${JSON.stringify(g).slice(0, 300)}`);
  return g;
}

/* The casedraft answer: a draft over a concluded question, made by the module's casedraft op. */
export function casedraft() {
  return draftOf(concludedWorld());
}

/* The reviewcopy answer: that draft's copy, read as a member with standing, with the publish gates refused:
   case-authoring's dry run answers the refusal its published preflight gives (a project below strength), so the copy carries
   `gates: "refused"` and what refused it. */
export function reviewcopy() {
  const w = concludedWorld();
  const d = draftOf(w);
  const { first: refused } = preflightAnswer().blocked;
  w.ca.gate = () => refused;
  return ops(w, { ...asMember, draft: d.draftId }).reviewcopy();
}

/* The reviewrevoke answer: a grant revoked by its maker, made by the module's revoke op. */
export function reviewrevoke() {
  const w = concludedWorld();
  const g = grantOf(w, draftOf(w).draftId);
  return ops(w, asMember, { grant: g.grantId }).reviewrevoke();
}

/* The reviewcomment answer: a comment an outside reader leaves on the draft through a live grant, made by the
   module's comment op at the reader's door (the door sends the link's fingerprint and `bySecret`). */
export function reviewcomment() {
  const w = concludedWorld();
  const d = draftOf(w);
  grantOf(w, d.draftId);
  return ops(w, { draft: d.draftId, bySecret: "1" }, { secretSha: SHARED, text: "Please check the second finding." }).reviewcomment();
}
