#!/bin/sh
# Rebuild the study's plain-text sources (src/) exactly as phase 1 read them.
# Usage: sh make-src.sh <bio checkout> <study dir>
# Pinned: product at 31f30a6c7d (tranche/T32), design branch claude/gallant-brown-zg0wc1 at bb387fffb2.
set -e
R=${1:?bio checkout}; S=${2:?study dir}
P=31f30a6c7dd64b46250f15ca71e6a43377ec93b9
B=bb387fffb27a381f36d6e261e5a26b00a79a167c
cd "$R"; git fetch -q origin claude/gallant-brown-zg0wc1 tranche/T32 || true
mkdir -p "$S/src/req" "$S/src/action-design"
show(){ git show "$1:$2"; }
for f in $(git ls-tree --name-only $P docs/architecture/ docs/development/ | grep '\.md$'); do show $P "$f" | fold -s -w 900 > "$S/src/$(basename "$f" .md).txt"; done
for f in $(git ls-tree -r --name-only $P docs/development/action-design/); do show $P "$f" | fold -s -w 900 > "$S/src/action-design/$(echo "${f#docs/development/action-design/}" | tr / _).txt"; done
for f in $(git ls-tree --name-only $P build/requirements/ | grep '\.md$'); do show $P "$f" | fold -s -w 900 > "$S/src/req/$(basename "$f" .md).txt"; done
h2t(){ show $B "docs/development/ux-substrate/$1" | python3 -c "
import sys,html,re
t=sys.stdin.read(); t=re.sub(r'(?is)<(style|script)[^>]*>.*?</\1>','',t)
t=re.sub(r'(?i)<br\s*/?>|</(p|div|li|h[1-6]|tr|section|article|summary|details|table|ul|ol|dd|dt)>','\n',t)
t=re.sub(r'<[^>]+>','',t); t=html.unescape(t); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n\n',t)
print(t)" | fold -s -w 900 > "$S/src/design-$2.txt"; }
h2t journeys.html journeys; h2t design-principles.html principles; h2t brand-and-voice.html brand; h2t measures-map.html measures
for v in matter-page plan-page start-and-send surfaces; do h2t views/$v.html view-$v; done
show $B docs/development/ux-substrate/HANDOFF.md | fold -s -w 900 > "$S/src/design-HANDOFF.txt"
show $B docs/development/ux-substrate/ux-experience.json | python3 -c "
import sys,json; d=json.load(sys.stdin)
for k in ['audiences','useCases','journeyExperience','surfaceRules']:
  open('$S/src/design-ux-'+k+'.txt','w').write(json.dumps(d[k],indent=1,ensure_ascii=False))"
for f in "$S"/src/design-ux-*.txt; do fold -s -w 900 "$f" > "$f.f" && mv "$f.f" "$f"; done
show $B docs/development/DECISIONS.md | fold -s -w 900 > "$S/src/DECISIONS-design-branch.txt"
rm -f "$S/src/DECISIONS.txt"
echo "src rebuilt: $(find "$S/src" -type f | wc -l) files"
