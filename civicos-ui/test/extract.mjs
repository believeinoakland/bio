/* Shared: extract the runtime script from ../app.html for the harnesses. */
import fs from "fs";
export function appScript(){
  const s = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const m = /<script>\n([\s\S]*?)\n<\/script>/.exec(s);
  if(!m) throw new Error("no script block in app.html");
  return m[1];
}
