#!/usr/bin/env python3
"""M-132 (D-453) negative control: build a corpus holding EXACTLY ONE shared value and
show tools/m119-idspace.py counts exactly one.

  python3 tools/m132-negative-control.py <dir>   # writes the corpus
  python3 tools/m119-idspace.py <dir>            # must print: resord SHARED 1

Declared before running. MUST count exactly one: resord 90001, planted in LEG's
MatterEnactmentNumber field and in a FIN text. MUST NOT count: 90002 (LEG only),
90003 (FIN only), fund 7777 (FIN only), 090001 (leading-zero look-alike).

RECORDED VACUOUS ARM: the 090001 plant never arms. The resord pattern is
\\b(\\d{4,5})\\s*C\\.?\\s?M\\.?\\s?S and 090001 is SIX digits, so \\b matches only at the
string's start, \\d{4,5} takes 09000, and the marker does not follow -- the value is never
extracted, so it could not have been counted either way. The leading-zero behaviour is
verified by --selftest's '03100~3100 printed as NEAR-MISS' arm instead. An arm that did
not arm is a finding, not a pass.
"""
import json, os, sys

d = sys.argv[1] if len(sys.argv) > 1 else "nc-corpus"
os.makedirs(d, exist_ok=True)
json.dump([{"MatterFile": "NC-1", "MatterTypeName": "City Resolution",
            "MatterEnactmentNumber": "90001 C.M.S.",
            "MatterTitle": "Subject: Negative control planted resolution"},
           {"MatterFile": "NC-2", "MatterTypeName": "City Resolution",
            "MatterEnactmentNumber": "90002 CMS",
            "MatterTitle": "Subject: a resolution present ONLY in Legistar"}],
          open(os.path.join(d, "0200-leg-nc.json"), "w"))
open(os.path.join(d, "0201-fin-nc.txt"), "w").write(
    "The Council adopted Resolution No. 90001 C.M.S. establishing the control. "
    "A look-alike with a leading zero, 090001 CMS, must NOT join. "
    "A resolution 90003 CMS appears only here. "
    "Fund 7777 Controlonly Fund appears only in this system. " * 60)
print("PLANTED exactly one shared value: resord 90001 (LEG enactment field <-> FIN text).")
print("MUST NOT join: 090001 (vacuous, see docstring), 90002 (LEG only), 90003 (FIN only), fund 7777 (FIN only).")
