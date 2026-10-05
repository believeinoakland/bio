import fs from "node:fs";
const html = fs.readFileSync("/home/user/bio/civicos-ui/app.html","utf8");
const lines = html.split("\n");
const ops = fs.readFileSync("ops.txt","utf8").trim().split("\n").map(l=>l.split(" "));
const out=[];
for (const [op, rw, ...rest] of ops){
  const w = new RegExp(`\\b${op}\\b`);
  const lineCount = lines.filter(l=>w.test(l)).length;
  const call = new RegExp(`(?:\\b(?:rec|recR|recPost|recPostR|actAsk|actAskPost|intentAsk|apiR|apiQ|api)\\(\\s*["'\`]${op}["'\`])|(?:op=${op}\\b)|(?:\\bop\\s*:\\s*["']${op}["'])`,"g");
  const calls = (html.match(call)||[]).length;
  out.push([op, rw, rest.join(" "), lineCount, calls]);
}
fs.writeFileSync("uicount.tsv", out.map(r=>r.join("\t")).join("\n"));
