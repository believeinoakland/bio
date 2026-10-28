/* The federal layer: Civicsmith's read-only layer for the United States (R109). Federal law's own facts only. Cut from the unsplit `oakland-alameda` profile at T53 (R114): every fact keeps its basis.
 * Level: federal. Plain data. */
export default {
  "id": "us-federal",
  "name": "United States (federal law)",
  "covers": [
    "United States"
  ],
  "test": false,
  "layer": {
    "level": "federal",
    "place": "United States",
    "origin": "civicsmith"
  },
  "coverage": {
    "as_of": "2027-12-31",
    "holidays_through": 2027
  },
  "records_laws": [
    {
      "level": "federal",
      "name": "Freedom of Information Act",
      "citation": "5 U.S.C. § 552",
      "stages": [
        {
          "stage": "request",
          "label": "request for records",
          "citation": "5 U.S.C. § 552(a)(3)(A)"
        },
        {
          "stage": "fee_waiver_request",
          "label": "request for a waiver or reduction of fees",
          "citation": "5 U.S.C. § 552(a)(4)(A)(iii)"
        },
        {
          "stage": "extension_notice",
          "label": "written notice of unusual circumstances",
          "citation": "5 U.S.C. § 552(a)(6)(B)(i)"
        },
        {
          "stage": "production",
          "label": "records made promptly available",
          "citation": "5 U.S.C. § 552(a)(3)(A)"
        },
        {
          "stage": "denial",
          "label": "determination denying the request",
          "citation": "5 U.S.C. § 552(a)(6)(A)(i)"
        },
        {
          "stage": "appeal",
          "label": "appeal of an adverse determination",
          "citation": "5 U.S.C. § 552(a)(6)(A)(i)"
        },
        {
          "stage": "appeal_decision",
          "label": "determination on the appeal",
          "citation": "5 U.S.C. § 552(a)(6)(A)(ii)"
        },
        {
          "stage": "court_filing",
          "label": "complaint in the district court",
          "citation": "5 U.S.C. § 552(a)(4)(B)"
        }
      ],
      "requesters": {
        "text": "any person; an element of the intelligence community does not make records available to a foreign government entity or its representative",
        "citation": "5 U.S.C. § 552(a)(3)(A), (E)",
        "status": "researched",
        "basis": "2026-10-21 foia-text"
      },
      "response": "foia_response",
      "basis": "2026-10-21 foia-text",
      "governs": [
        "federal"
      ]
    }
  ],
  "deadlines": [
    {
      "rule": "foia_response",
      "label": "answer to a first request",
      "applies_to": "records_request",
      "units": "days",
      "amount": 20,
      "count": "business",
      "direction": "forward",
      "starts": "received",
      "closures": "federal",
      "extension": {
        "days": 10,
        "count": "business",
        "when": "unusual circumstances, by written notice to the requester",
        "citation": "5 U.S.C. § 552(a)(6)(B)(i)"
      },
      "tolling": [
        {
          "when": "the agency awaits information it reasonably requested from the requester",
          "citation": "5 U.S.C. § 552(a)(6)(A)(ii)(I)"
        },
        {
          "when": "the agency awaits clarification of the requester's fee assessment",
          "citation": "5 U.S.C. § 552(a)(6)(A)(ii)(II)"
        }
      ],
      "owed_by": "body",
      "consequence": {
        "text": "shall be deemed to have exhausted his administrative remedies with respect to such request if the agency fails to comply with the applicable time limit provisions of this paragraph",
        "citation": "5 U.S.C. § 552(a)(6)(C)(i)"
      },
      "citation": "5 U.S.C. § 552(a)(6)(A)(i)",
      "status": "researched",
      "basis": "2026-10-05 time-law, 2026-10-11 actions-law"
    },
    {
      "rule": "foia_appeal_response",
      "label": "decision on an appeal",
      "applies_to": "records_request",
      "units": "days",
      "amount": 20,
      "count": "business",
      "direction": "forward",
      "starts": "received",
      "closures": "federal",
      "owed_by": "body",
      "consequence": {
        "text": "shall be deemed to have exhausted his administrative remedies with respect to such request if the agency fails to comply with the applicable time limit provisions of this paragraph",
        "citation": "5 U.S.C. § 552(a)(6)(C)(i)"
      },
      "citation": "5 U.S.C. § 552(a)(6)(A)(ii)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    }
  ],
  "holidays": [
    {
      "year": 2026,
      "list": "federal",
      "citation": "5 U.S.C. § 6103(a)",
      "days": [
        {
          "date": "2026-01-01",
          "name": "New Year's Day"
        },
        {
          "date": "2026-01-19",
          "name": "Birthday of Martin Luther King, Jr."
        },
        {
          "date": "2026-02-16",
          "name": "Washington's Birthday"
        },
        {
          "date": "2026-05-25",
          "name": "Memorial Day"
        },
        {
          "date": "2026-06-19",
          "name": "Juneteenth National Independence Day"
        },
        {
          "date": "2026-07-03",
          "name": "Independence Day (observed, 5 U.S.C. § 6103(b))"
        },
        {
          "date": "2026-07-04",
          "name": "Independence Day"
        },
        {
          "date": "2026-09-07",
          "name": "Labor Day"
        },
        {
          "date": "2026-10-12",
          "name": "Columbus Day"
        },
        {
          "date": "2026-11-11",
          "name": "Veterans Day"
        },
        {
          "date": "2026-11-26",
          "name": "Thanksgiving Day"
        },
        {
          "date": "2026-12-25",
          "name": "Christmas Day"
        }
      ],
      "status": "researched",
      "basis": "2026-10-05 time-law; 2026-10-05 holidays-extra"
    },
    {
      "year": 2027,
      "list": "federal",
      "citation": "5 U.S.C. § 6103(a), (b)",
      "days": [
        {
          "date": "2027-01-01",
          "name": "New Year's Day"
        },
        {
          "date": "2027-01-18",
          "name": "Birthday of Martin Luther King, Jr."
        },
        {
          "date": "2027-02-15",
          "name": "Washington's Birthday"
        },
        {
          "date": "2027-05-31",
          "name": "Memorial Day"
        },
        {
          "date": "2027-06-18",
          "name": "Juneteenth National Independence Day (observed)"
        },
        {
          "date": "2027-06-19",
          "name": "Juneteenth National Independence Day"
        },
        {
          "date": "2027-07-04",
          "name": "Independence Day"
        },
        {
          "date": "2027-07-05",
          "name": "Independence Day (observed)"
        },
        {
          "date": "2027-09-06",
          "name": "Labor Day"
        },
        {
          "date": "2027-10-11",
          "name": "Columbus Day"
        },
        {
          "date": "2027-11-11",
          "name": "Veterans Day"
        },
        {
          "date": "2027-11-25",
          "name": "Thanksgiving Day"
        },
        {
          "date": "2027-12-24",
          "name": "Christmas Day (observed)"
        },
        {
          "date": "2027-12-25",
          "name": "Christmas Day"
        },
        {
          "date": "2027-12-31",
          "name": "New Year's Day 2028 (observed)"
        }
      ],
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    }
  ],
  "standard_sources": [
    {
      "source": "Freedom of Information Act",
      "kind": "statute",
      "issuer": "United States Congress",
      "level": "federal",
      "cite": {
        "re": "\\b5\\s+U\\.?\\s?S\\.?\\s?C\\.?\\s+§+\\s*552\\b",
        "flags": "i"
      },
      "basis": "2026-10-05 time-law"
    }
  ],
  "forums": [
    {
      "label": "United States District Court, Northern District of California",
      "forum_kind": "court",
      "basis": "2026-10-25 cand-jurisdiction-map"
    }
  ],
  "action_kinds": [
    {
      "kind": "records_request",
      "label": "public records request",
      "laws": [
        "Freedom of Information Act"
      ],
      "basis": "D-182"
    }
  ],
  "weekend": {
    "days": [
      "sat",
      "sun"
    ],
    "citation": "5 U.S.C. § 552(a)(6)(A)(i)",
    "status": "researched",
    "basis": "2026-10-05 time-law"
  }
};
