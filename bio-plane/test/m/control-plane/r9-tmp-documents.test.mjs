import "../../sandbox.mjs";
import { after } from "node:test";
import { makeKit } from "./r8-kit.mjs";
import { sections as documents } from "./r9-seam-documents.mjs";

const kit = makeKit({ tag: "r9seam" });
const counting = makeKit({ tag: "r9seamc", counting: true });
after(() => { kit.mf.dispose(); counting.mf.dispose(); });
documents(kit, counting);
