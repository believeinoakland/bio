cd /home/user/bio
OD=bio-plane/src/op-declarations/index.mjs
UI=civicos-ui/app.html
check() { mod=$1; shift; echo "== $mod"; for op in "$@"; do
  decl=$(grep -E "^\s+\"?$op\"?\s*:\s*\{" $OD | head -1 | sed -E 's/\s+/ /g' | cut -c1-90)
  ui=$(grep -c "op=$op\b" $UI); ui2=$(grep -cE "[\"'\`]$op[\"'\`]" $UI)
  echo "  $op | decl: ${decl:-NONE} | ui op=: $ui | ui quoted: $ui2"; done; }
check extraction reading readingref textprovenance pdfstructure calibrationdrift acquire
check content content contentcrop contentmint textattest attesttext transcribe transcriptionattest transcription versionnotice
check entities readingname readingnameplan entitycreate entityalias relationdeclare aliaswithdraw relationwithdraw resolutiondefect entity entitybyalias relation resolutions concerns idmatch resolve resolvetestify
check connections connect connections connectionchoose backlinks dangling linkproject connectionassert connectionsasserted filemembershipstore filemembership filemembershipjudge themedeclare themeplace themepropose themeread themewithdraw
check progressions progressiondefine progression thread instance discharge exceptions proposals captureprogressions proposedispose
check bias biasmanifest biasadopt biasinhale biasdebtresolve biasdebt
