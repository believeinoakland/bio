/* R6, R57 (K1503: D-260) — a call that carries no account is refused NO_ACCOUNT by name before any plane call, so a run
 * refused for it is left exactly as it was. This is the one arm of the segment-dispatch suite that asserts the shell's
 * own wire (the refusal is the shell's, not a step's); the dispatch refusal itself (`agent-steps` R34) is driven
 * through `driveHarness` in `agent-steps`' suite. */
import "../../bio-plane/test/sandbox.mjs";
import worker from "../src/index.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass += 1; else fail += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`}`);
};

const AIK = "aik-" + "e".repeat(64);

console.log("\n--- R6, R57 · no account: NO_ACCOUNT before any plane write ---");
{
  const calls = [];
  const plane = { fetch: async (url) => { calls.push(String(url)); return Response.json({ ok: true, result: {} }); } };
  const na = await worker.fetch(new Request("http://agent-worker/run", { method: "POST", body: JSON.stringify({
    run_id: "RUN-r107", store: "scratch", credential: AIK }) }), { VERSION: "r107", PLANE: plane });
  const body = await na.json();
  t("R6, R57: a call with no account is refused NO_ACCOUNT before any plane call", [na.status, body.code, calls.length], [409, "NO_ACCOUNT", 0]);
}

console.log(`\nr107: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
