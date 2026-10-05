import fs from "node:fs";
const html = fs.readFileSync("/home/user/bio/civicos-ui/app.html","utf8");
const ops = fs.readFileSync("ops.txt","utf8").trim().split("\n").map(l=>l.split(" ")[0]);
const res={};
for(const op of ops){
  const fn = (html.match(new RegExp(`\\b(?:rec|recR|recPost|recPostR|actAsk|actAskPost|intentAsk|apiR|apiQ)\\(\\s*["'\`]${op}["'\`]`,"g"))||[]).length;
  const obj = (html.match(new RegExp(`\\bop\\s*:\\s*["']${op}["']`,"g"))||[]).length;
  const url = (html.match(new RegExp(`[?&]op=${op}\\b|op=\\$\\{?["']?${op}`,"g"))||[]).length;
  res[op]={fn,obj,url};
}
fs.writeFileSync("uicount2.json",JSON.stringify(res));
const show=process.argv.slice(2);
for(const op of show) console.log(op, JSON.stringify(res[op]));
