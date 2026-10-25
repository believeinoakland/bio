import test from "node:test";
import { actionWorld, filingIn, answerOf, openIn } from "./world-C.mjs";
const show = async (label, f) => { try { const r = await f(); console.log(label, JSON.stringify(r).slice(0, 700)); return r; } catch (e) { console.log(label, "ERR", String(e.message).slice(0, 600)); } };
test("x", async () => {
  const { world, me, project, action } = await actionWorld();
  const f = await filingIn(me, action, { sent: true });
  await show("save", () => me.act("templatesave", { body: { filing: f, name: "A federal records request", use: "file", project } }));
  await show("tfa", () => me.read("templatesforaction", { query: { action } }));
  await show("actions", () => me.read("action", { query: { id: action } }).then(a => a.correspondence));
  const r = await world.signIn("reader", { admin: false, capabilities: [] });
  await show("reader sees", () => r.read("action", { query: { id: action } }).then(a => a.id));
  await show("reader whoami", () => r.read("whoami"));
});
