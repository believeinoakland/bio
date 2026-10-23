import { Miniflare } from "./mf.mjs";
const m = new Miniflare({ modules: true, script: "export default {fetch(){return new Response('x')}}", totallyBogusOption: 1 }); await m.ready; console.log("bogus key accepted too (unknown keys silently stripped)"); await m.dispose();
