import fs from "node:fs";
const od = await import("/home/user/bio/bio-plane/src/op-declarations/index.mjs");
const ui = Object.fromEntries(fs.readFileSync("uicount.tsv","utf8").trim().split("\n").map(l=>{const [op,rw,lists,lines,calls]=l.split("\t");return [op,{lines:+lines,calls:+calls}];}));
const C = {
 TIME: ["reminderset","reminderanswer","factsdue","factstatus","factconfirm","escalationsdue","escalationstatus","escalationopen","escalationadvance","escalationevaluate","escalationsuspend","escalationresume","escalationdecline","declinetoescalate","escalationend","escalationreasondraft","escalation","plan","plans","planopen","checkpointrecord","scenarioset","optionstart","optionstartpreview","monitor","monitoring","monitorpause","monitorslate","addressfrequencyset","progression","progressiondefine","captureprogressions","exceptions","instance","proposals","proposedispose","thread","discharge","connect","queue","queuesnooze","notices","noticepost","noticeprepare","lateattestations","versionchain","reevaluationchanges","reevaluations","action","actions","actioncreate","actionmove","actioncorrespond","projection","profiles","sweeps","actionhold","actionholdrelease","docketprepare"],
 ORGANISATIONS: ["entity","entitycreate","entityalias","entitybyalias","aliaswithdraw","relation","relationdeclare","relationwithdraw","resolve","resolutions","resolvetestify","resolutiondefect","idmatch","concerns","readingname","aspirationcontacts","addressed","addressedrecord","factstatus","factconfirm","profiles","sourceof","sourcerung","action","actioncorrespond"],
 LAW: ["standard","standards","standardinforce","standarddeclare","standardadopt","standardpropose","actionlaws","actionlawspropose","comparison","comparisonfacts","comparisonpropose","determine","determination","determinations","availableactions","actionkinds","filingprepare","filingapprove","filingsent","filingsfor","theorypropose","communicationprepare","templates","templatedraft","templateread","contradictionresolve","contradictioncandidates","profiles","affordances"],
 COURTS: ["actionhold","actionholdrelease","actionholdpreview","projectholds","actionpressure","counselpacket","counselpacketexport","counselpacketread","actioncorrespond","theorypropose","escalation","escalationopen","escalationadvance","actionrisktier","actionriskpropose","docket","docketfile","docketpost"],
 ANALYSIS: ["consequence","consequencesof","consequencerecord","consequencerevise","comparison","comparisonfacts","search","searchfields","meaningrows","select","selection","selectionlist","projection","list","stats","objectivegaps","objectiveprogress","inquirystrength","versionstrength","strengthbar","strengthbarof","calibrations","calibrationdrift","contentaxis","partitionindependence","homecensus","extractproposals","extractpropose","contentmint","content","export","exportlog","caseflags","publishededitions"],
 QUESTIONS: ["airun","airuns","airunlog","airunopen","airunclose","airuntick","airunspawn","suggest","extractpropose","themepropose","lead","leadlist","leadlook","leadread","leadshare","search","searchfields","meaningrows","affordances","capturerequest","capturerequests","contradictionpropose","contradictionrecommend","workobjective","wizardcheck","wizardpropose","wizardsat","whatchangedpropose","escalationreasondraft","optionpropose","planproposals","templatepropose","theorypropose","comparisonpropose","standardpropose","actionlawspropose","actionriskpropose","intentproposals","aicredentialmint","aicredentials","narrow","narrowcandidates","basisversions","versionchain","whoami"],
};
const reach = (op)=>{const s=od.OPS[op]; if(!s) return "NO-SPEC";
  const cls = s.classes; const pub = cls===null;
  if(pub) return "public";
  if(!s.mutating) return cls.includes("member")?"member-read":"not-member("+cls.join("/")+")";
  return od.SESSION_OPS.member.has(op)?"member-write":(od.SESSION_OPS.admin.has(op)?"founder-only":"credential-only");
};
let out="";
for(const [c,ops] of Object.entries(C)){
  out+=`\n### ${c}\n`;
  for(const op of ops){ const s=od.OPS[op]; const u=ui[op]||{lines:0,calls:0};
    out+=`${op}\t${s?(s.mutating?"W":"R"):"?"}\t${reach(op)}\tui_calls=${u.calls}\tui_lines=${u.lines}\n`;}
}
fs.writeFileSync("construct-ops.tsv",out); console.log(out);
