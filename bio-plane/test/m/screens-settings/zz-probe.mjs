import { storeWorld } from "./kit.mjs";
const w = await storeWorld({ claimed: false, env: { VERSION: "0.83.0" } });
console.log(Object.keys(w).join(","), w.claimed);
const c = await w.claim({ password: "a-long-enough-passphrase-for-founder" });
console.log(JSON.stringify(c).slice(0,300), JSON.stringify(w.founder));
const f = await w.signIn("admin");
console.log(JSON.stringify(await f.read("whoami")));
console.log(JSON.stringify((await f.read("memberlist")).members));
