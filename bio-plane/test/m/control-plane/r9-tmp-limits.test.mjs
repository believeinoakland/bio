import "../../sandbox.mjs";
import { after } from "node:test";
import { makeKit } from "./r8-kit.mjs";
import { sections as limits } from "./r9-seam-limits.mjs";

const kit = makeKit({ tag: "r9lim" });
const counting = makeKit({ tag: "r9limc", counting: true });
after(() => { kit.mf.dispose(); counting.mf.dispose(); });
limits(kit, counting);
