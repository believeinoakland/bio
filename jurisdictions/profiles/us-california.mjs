/* The California layer: the state's own facts (R110). Cut from the unsplit `oakland-alameda` profile at T53 (R114): every fact keeps its basis.
 * Level: state. Plain data. */
export default {
  "id": "us-california",
  "name": "State of California",
  "covers": [
    "California"
  ],
  "test": false,
  "layer": {
    "level": "state",
    "place": "California",
    "within": "us-federal",
    "origin": "civicsmith"
  },
  "coverage": {
    "as_of": "2026-12-25",
    "holidays_through": 2026
  },
  "records_laws": [
    {
      "level": "state",
      "name": "California Public Records Act",
      "citation": "Cal. Gov. Code § 7920.000 et seq.",
      "stages": [
        {
          "stage": "request",
          "label": "request for a copy of records",
          "citation": "Cal. Gov. Code § 7922.530(a)"
        },
        {
          "stage": "extension_notice",
          "label": "written notice extending the time limit in unusual circumstances",
          "citation": "Cal. Gov. Code § 7922.535(b)"
        },
        {
          "stage": "production",
          "label": "records made promptly available",
          "citation": "Cal. Gov. Code § 7922.530(a)"
        },
        {
          "stage": "denial",
          "label": "written determination that the request is denied",
          "citation": "Cal. Gov. Code § 7922.540(a)"
        },
        {
          "stage": "court_filing",
          "label": "verified petition to the superior court",
          "citation": "Cal. Gov. Code §§ 7923.000, 7923.100"
        }
      ],
      "requesters": {
        "text": "any person, including a corporation, partnership, firm or association; no purpose need be given",
        "citation": "Cal. Gov. Code §§ 7920.520, 7921.300, 7922.530(a)",
        "status": "researched",
        "basis": "2026-10-11 actions-law"
      },
      "response": "records_response",
      "basis": "D-149",
      "governs": [
        "state",
        "county",
        "city",
        "district"
      ]
    }
  ],
  "deadlines": [
    {
      "rule": "records_response",
      "applies_to": "records_request",
      "units": "days",
      "amount": 10,
      "count": "calendar",
      "direction": "forward",
      "starts": "received",
      "roll": true,
      "closures": "judicial",
      "computation": "ccp_12",
      "extension": {
        "days": 14,
        "count": "calendar",
        "when": "unusual circumstances (Gov. Code § 7922.535(c)(1)–(6)), by written notice to the requester",
        "citation": "Cal. Gov. Code § 7922.535(b)"
      },
      "owed_by": "body",
      "citation": "Cal. Gov. Code § 7922.535(a)",
      "status": "researched",
      "basis": "2026-10-05 time-law"
    },
    {
      "rule": "agenda_posting_regular",
      "applies_to": "public_comment",
      "units": "hours",
      "amount": 72,
      "direction": "backward",
      "starts": "act",
      "owed_by": "body",
      "citation": "Cal. Gov. Code § 54954.2(a)(1)",
      "status": "researched",
      "basis": "2026-10-05 time-law"
    },
    {
      "rule": "special_meeting_notice",
      "applies_to": "public_comment",
      "units": "hours",
      "amount": 24,
      "direction": "backward",
      "starts": "act",
      "owed_by": "body",
      "citation": "Cal. Gov. Code § 54956(a)",
      "status": "researched",
      "basis": "2026-10-05 time-law"
    },
    {
      "rule": "claim_presentation_injury",
      "applies_to": "claim",
      "units": "months",
      "amount": 6,
      "direction": "forward",
      "starts": "act",
      "roll": true,
      "closures": "judicial",
      "owed_by": "group",
      "citation": "Cal. Gov. Code § 911.2(a) (death, personal injury, personal property, growing crops)",
      "status": "researched",
      "basis": "2026-10-05 time-law"
    },
    {
      "rule": "claim_presentation_other",
      "applies_to": "claim",
      "units": "years",
      "amount": 1,
      "direction": "forward",
      "starts": "act",
      "roll": true,
      "closures": "judicial",
      "owed_by": "group",
      "citation": "Cal. Gov. Code § 911.2(a) (any other claim)",
      "status": "researched",
      "basis": "2026-10-05 time-law"
    },
    {
      "rule": "claim_suit_after_rejection",
      "applies_to": "claim",
      "units": "months",
      "amount": 6,
      "direction": "forward",
      "starts": "served",
      "roll": true,
      "closures": "judicial",
      "owed_by": "group",
      "citation": "Cal. Gov. Code § 945.6(a)(1)",
      "status": "researched",
      "basis": "2026-10-05 time-law"
    },
    {
      "rule": "claim_board_action",
      "applies_to": "claim",
      "units": "days",
      "amount": 45,
      "count": "calendar",
      "direction": "forward",
      "starts": "filed",
      "roll": true,
      "closures": "judicial",
      "computation": "ccp_12",
      "owed_by": "body",
      "consequence": {
        "text": "the claim shall be deemed to have been rejected by the board on the last day of the period within which the board was required to act upon the claim",
        "citation": "Cal. Gov. Code § 912.4(c)"
      },
      "citation": "Cal. Gov. Code § 912.4(a)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    },
    {
      "rule": "brown_act_demand",
      "applies_to": "brown_act_demand",
      "units": "days",
      "amount": 90,
      "count": "calendar",
      "direction": "forward",
      "starts": "act",
      "roll": true,
      "closures": "judicial",
      "computation": "ccp_12",
      "owed_by": "group",
      "citation": "Cal. Gov. Code § 54960.1(c)(1)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    },
    {
      "rule": "brown_act_demand_agenda",
      "applies_to": "brown_act_demand",
      "units": "days",
      "amount": 30,
      "count": "calendar",
      "direction": "forward",
      "starts": "act",
      "roll": true,
      "closures": "judicial",
      "computation": "ccp_12",
      "owed_by": "group",
      "citation": "Cal. Gov. Code § 54960.1(c)(1) (an action in open session in violation of § 54954.2)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    },
    {
      "rule": "brown_act_cure",
      "applies_to": "brown_act_demand",
      "units": "days",
      "amount": 30,
      "count": "calendar",
      "direction": "forward",
      "starts": "received",
      "roll": true,
      "closures": "judicial",
      "computation": "ccp_12",
      "owed_by": "body",
      "consequence": {
        "text": "the inaction shall be deemed a decision not to cure or correct the challenged action",
        "citation": "Cal. Gov. Code § 54960.1(c)(3)"
      },
      "citation": "Cal. Gov. Code § 54960.1(c)(2)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    },
    {
      "rule": "grand_jury_body_comment",
      "applies_to": "grand_jury",
      "units": "days",
      "amount": 90,
      "count": "calendar",
      "direction": "forward",
      "starts": "third_party",
      "starter": {
        "role": "Civil Grand Jury",
        "body": "Alameda County Civil Grand Jury"
      },
      "roll": true,
      "closures": "judicial",
      "computation": "ccp_12",
      "owed_by": "body",
      "citation": "Cal. Penal Code § 933(c)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    },
    {
      "rule": "grand_jury_officer_comment",
      "applies_to": "grand_jury",
      "units": "days",
      "amount": 60,
      "count": "calendar",
      "direction": "forward",
      "starts": "third_party",
      "starter": {
        "role": "Civil Grand Jury",
        "body": "Alameda County Civil Grand Jury"
      },
      "roll": true,
      "closures": "judicial",
      "computation": "ccp_12",
      "owed_by": "body",
      "citation": "Cal. Penal Code § 933(c) (an elected county officer or agency head)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    },
    {
      "rule": "grand_jury_further_analysis",
      "applies_to": "grand_jury",
      "units": "months",
      "amount": 6,
      "direction": "forward",
      "starts": "third_party",
      "starter": {
        "role": "Civil Grand Jury",
        "body": "Alameda County Civil Grand Jury"
      },
      "roll": true,
      "closures": "judicial",
      "owed_by": "body",
      "citation": "Cal. Penal Code § 933.05(b)(3)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    },
    {
      "rule": "anti_slapp_motion",
      "applies_to": "claim",
      "units": "days",
      "amount": 60,
      "count": "calendar",
      "direction": "forward",
      "starts": "served",
      "roll": true,
      "closures": "judicial",
      "computation": "ccp_12",
      "owed_by": "group",
      "defends": true,
      "citation": "Cal. Code Civ. Proc. § 425.16(f)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    }
  ],
  "holidays": [
    {
      "year": 2026,
      "offices": [
        "State Controller"
      ],
      "days": [
        {
          "date": "2026-01-01",
          "name": "New Year's Day"
        },
        {
          "date": "2026-01-19",
          "name": "Martin Luther King Jr. Day"
        },
        {
          "date": "2026-02-16",
          "name": "Presidents' Day"
        },
        {
          "date": "2026-03-31",
          "name": "Cesar Chavez Day"
        },
        {
          "date": "2026-05-25",
          "name": "Memorial Day"
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
          "date": "2026-11-11",
          "name": "Veteran's Day"
        },
        {
          "date": "2026-11-26",
          "name": "Thanksgiving Day"
        },
        {
          "date": "2026-11-27",
          "name": "Day after Thanksgiving"
        },
        {
          "date": "2026-12-25",
          "name": "Christmas Day"
        }
      ],
      "status": "researched",
      "basis": "M-191"
    },
    {
      "year": 2026,
      "list": "judicial",
      "citation": "Cal. Code Civ. Proc. § 135",
      "days": [
        {
          "date": "2026-01-01",
          "name": "New Year's Day"
        },
        {
          "date": "2026-01-19",
          "name": "Martin Luther King Jr.'s Birthday"
        },
        {
          "date": "2026-02-12",
          "name": "Lincoln's Birthday"
        },
        {
          "date": "2026-02-16",
          "name": "Washington's Birthday"
        },
        {
          "date": "2026-03-31",
          "name": "Cesar Chavez Day"
        },
        {
          "date": "2026-05-25",
          "name": "Memorial Day"
        },
        {
          "date": "2026-06-19",
          "name": "Juneteenth"
        },
        {
          "date": "2026-07-03",
          "name": "Independence Day (observed)"
        },
        {
          "date": "2026-09-07",
          "name": "Labor Day"
        },
        {
          "date": "2026-09-25",
          "name": "Native American Day"
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
          "date": "2026-11-27",
          "name": "Day after Thanksgiving"
        },
        {
          "date": "2026-12-25",
          "name": "Christmas Day"
        }
      ],
      "status": "researched",
      "basis": "M-189, 2026-10-05 time-law"
    },
    {
      "year": 2018,
      "list": "judicial",
      "citation": "Cal. Code Civ. Proc. § 135 (as in force in 2018); San Diego Super. Ct. holiday schedule 2018",
      "days": [
        {
          "date": "2018-01-01",
          "name": "New Year's Day"
        },
        {
          "date": "2018-01-15",
          "name": "Martin Luther King Jr. Day"
        },
        {
          "date": "2018-02-12",
          "name": "Lincoln's Birthday"
        },
        {
          "date": "2018-02-19",
          "name": "Presidents' Day"
        },
        {
          "date": "2018-03-30",
          "name": "Cesar Chavez Day (observed)"
        },
        {
          "date": "2018-05-28",
          "name": "Memorial Day"
        },
        {
          "date": "2018-07-04",
          "name": "Independence Day"
        },
        {
          "date": "2018-09-03",
          "name": "Labor Day"
        },
        {
          "date": "2018-10-08",
          "name": "Columbus Day"
        },
        {
          "date": "2018-11-12",
          "name": "Veterans Day (observed)"
        },
        {
          "date": "2018-11-22",
          "name": "Thanksgiving"
        },
        {
          "date": "2018-11-23",
          "name": "Day after Thanksgiving"
        },
        {
          "date": "2018-12-25",
          "name": "Christmas Day"
        }
      ],
      "status": "researched",
      "basis": "2026-10-05 holidays-extra"
    },
    {
      "year": 2020,
      "list": "judicial",
      "citation": "Cal. Code Civ. Proc. § 135 (as in force in 2020); San Diego Super. Ct. holiday schedule 2020",
      "days": [
        {
          "date": "2020-01-01",
          "name": "New Year's Day"
        },
        {
          "date": "2020-01-20",
          "name": "Martin Luther King Jr. Day"
        },
        {
          "date": "2020-02-12",
          "name": "Lincoln's Birthday"
        },
        {
          "date": "2020-02-17",
          "name": "Presidents' Day"
        },
        {
          "date": "2020-03-31",
          "name": "Cesar Chavez Day"
        },
        {
          "date": "2020-05-25",
          "name": "Memorial Day"
        },
        {
          "date": "2020-07-03",
          "name": "Independence Day (observed)"
        },
        {
          "date": "2020-09-07",
          "name": "Labor Day"
        },
        {
          "date": "2020-10-12",
          "name": "Columbus Day"
        },
        {
          "date": "2020-11-11",
          "name": "Veterans Day"
        },
        {
          "date": "2020-11-26",
          "name": "Thanksgiving"
        },
        {
          "date": "2020-11-27",
          "name": "Day after Thanksgiving"
        },
        {
          "date": "2020-12-25",
          "name": "Christmas Day"
        }
      ],
      "status": "researched",
      "basis": "2026-10-05 holidays-extra"
    }
  ],
  "counterparties": [
    {
      "role": "State Controller",
      "body": "California State Controller's Office",
      "level": "state",
      "elected": true,
      "basis": "2026-10-05 time-law"
    }
  ],
  "standard_sources": [
    {
      "source": "California Government Code",
      "kind": "statute",
      "issuer": "California Legislature",
      "level": "state",
      "cite": {
        "re": "\\b(?:Cal(?:ifornia|\\.)?\\s+)?Gov(?:ernment|\\.|t\\.?)?\\s+Code\\s+(?:§+\\s*|Section\\s+)?\\d+(?:\\.\\d+)?",
        "flags": "i"
      },
      "basis": "2026-10-05 time-law"
    },
    {
      "source": "California Code of Civil Procedure",
      "kind": "statute",
      "issuer": "California Legislature",
      "level": "state",
      "cite": {
        "re": "\\b(?:Cal(?:ifornia|\\.)?\\s+)?(?:Code\\s+(?:of\\s+)?Civ(?:il|\\.)?\\s+Proc(?:edure|\\.)?|C\\.?C\\.?P\\.?)\\s+(?:§+\\s*|Section\\s+)?\\d+[a-z]?",
        "flags": "i"
      },
      "basis": "2026-10-05 time-law"
    }
  ],
  "legal_facts": [
    {
      "key": "recording_open_meeting",
      "trigger": "recording",
      "statement": "Anyone attending an open and public meeting of a local legislative body may record it, unless the body reasonably finds that the recording would persistently disrupt the meeting through noise, light or blocking the view.",
      "citation": "Cal. Gov. Code § 54953.5(a)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    },
    {
      "key": "recording_consent",
      "trigger": "recording",
      "statement": "Recording a confidential communication without the consent of every party to it is a crime in California; a communication in a public gathering or an open public proceeding is not confidential.",
      "citation": "Cal. Penal Code § 632(a), (c)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    },
    {
      "key": "serial_meeting",
      "trigger": "serial_meeting",
      "statement": "A majority of a legislative body's members may not, outside a noticed meeting, use a series of communications of any kind, directly or through intermediaries, to discuss, deliberate or act on business within the body's jurisdiction.",
      "citation": "Cal. Gov. Code § 54952.2(b)(1)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    },
    {
      "key": "campaign_spending",
      "trigger": "pending_measure_or_candidate",
      "statement": "Spending $1,000 or more in a calendar year on communications that expressly advocate for or against a clearly identified candidate or measure, not made at a candidate's or committee's behest, makes the spender a committee under the Political Reform Act.",
      "citation": "Cal. Gov. Code §§ 82013(b), 82031",
      "threshold": {
        "amount": 1000,
        "unit": "USD in a calendar year"
      },
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    },
    {
      "key": "anti_slapp",
      "trigger": "threat_letter",
      "statement": "A lawsuit arising from a statement made before, or about an issue under review by, a legislative, executive or judicial body, or in a public forum on an issue of public interest, may be met by a special motion to strike, filed within 60 days of service of the complaint.",
      "citation": "Cal. Code Civ. Proc. § 425.16(b)(1), (e), (f)",
      "status": "researched",
      "basis": "2026-10-11 actions-law"
    }
  ],
  "lawful_demands": [
    {
      "kind": "official_home_contact",
      "label": "demand by a public official to remove their home address or telephone number",
      "covers": [
        "home_address",
        "phone"
      ],
      "within": {
        "amount": 48,
        "units": "hours"
      },
      "citation": "Cal. Gov. Code § 7928.215",
      "status": "ruled",
      "basis": "K1493"
    }
  ],
  "forums": [
    {
      "label": "Court of Appeal of California, First Appellate District",
      "forum_kind": "court",
      "basis": "2026-10-25 first-district-about"
    },
    {
      "label": "Supreme Court of California",
      "forum_kind": "court",
      "basis": "2026-10-25 supreme-court-home"
    }
  ],
  "pointers": [
    {
      "kind": "selfhelp",
      "name": "Self-Help Guide to the California Courts",
      "does": "The Judicial Council's guides and information for people handling a court case on their own.",
      "contacts": [
        {
          "how": "web",
          "value": "https://selfhelp.courts.ca.gov/"
        }
      ],
      "source": "https://selfhelp.courts.ca.gov/",
      "status": "researched",
      "basis": "2026-10-14 pointers"
    }
  ],
  "action_kinds": [
    {
      "kind": "grand_jury",
      "label": "complaint to the civil grand jury",
      "tier": 1,
      "basis": "D-182"
    },
    {
      "kind": "public_comment",
      "label": "public comment to a body",
      "tier": 1,
      "basis": "K2785"
    },
    {
      "kind": "brown_act_demand",
      "label": "demand to cure or correct an action taken in violation of the Brown Act",
      "tier": 2,
      "laws": [
        "California Government Code"
      ],
      "advisory": "File with caution: the demand must be made in writing within the period the law sets, and an action to void must follow within 15 days of the body's answer, or be barred (Gov. Code § 54960.1(c)). Legal review before filing is recommended.",
      "basis": "K2785"
    }
  ],
  "computation": [
    {
      "key": "ccp_12",
      "rule": "exclude_first_include_last",
      "citation": "Cal. Code Civ. Proc. § 12; Cal. Gov. Code § 6800",
      "status": "researched",
      "basis": "2026-10-05 time-law"
    }
  ],
  "time_zone": {
    "value": "America/Los_Angeles",
    "status": "researched",
    "basis": "M-187"
  },
  "weekend": {
    "days": [
      "sat",
      "sun"
    ],
    "citation": "Cal. Code Civ. Proc. § 12a(a); Cal. Gov. Code § 6700(a)",
    "status": "researched",
    "basis": "2026-10-05 time-law"
  },
  "records_help": [
    {
      "law": "California Public Records Act",
      "days": 10,
      "extra_days": 14,
      "extension_reasons": [
        {
          "reason": "the records must be searched for and collected from field facilities or other establishments separate from the office processing the request",
          "citation": "Cal. Gov. Code § 7922.535(c)(1)"
        },
        {
          "reason": "a voluminous amount of separate and distinct records is demanded in a single request",
          "citation": "Cal. Gov. Code § 7922.535(c)(2)"
        },
        {
          "reason": "the agency must consult another agency with a substantial interest in the request, or two or more of its own components",
          "citation": "Cal. Gov. Code § 7922.535(c)(3)"
        },
        {
          "reason": "data must be compiled, a program written, or a computer report constructed to extract the data",
          "citation": "Cal. Gov. Code § 7922.535(c)(4)"
        },
        {
          "reason": "a cyberattack stops the agency reaching its electronic servers or systems",
          "citation": "Cal. Gov. Code § 7922.535(c)(5)"
        },
        {
          "reason": "a state of emergency proclaimed by the Governor directly affects the agency's ability to respond, through staffing shortages or closed facilities",
          "citation": "Cal. Gov. Code § 7922.535(c)(6)"
        }
      ],
      "citations": {
        "answer": "Cal. Gov. Code § 7922.535(a)",
        "extend": "Cal. Gov. Code § 7922.535(b)",
        "assist": "Cal. Gov. Code § 7922.600(a)",
        "segregate": "Cal. Gov. Code § 7922.525(b)",
        "refuse_in_writing": "Cal. Gov. Code § 7922.540(a)",
        "electronic": "Cal. Gov. Code § 7922.570(a)",
        "cost": "Cal. Gov. Code § 7922.530(a)",
        "cost_electronic": "Cal. Gov. Code § 7922.575(a)",
        "inspect_photograph": "Cal. Gov. Code § 7922.530(b)",
        "purpose": "Cal. Gov. Code § 7921.300"
      },
      "status": "researched",
      "basis": "2026-10-25 leginfo-bulk-download, 2026-10-25 opd-dgo-m-9-1, 2026-10-11 actions-law"
    }
  ],
  "vocabulary": {
    "response_statuses": [
      {
        "status": "finding_agreed",
        "label": "The respondent agrees with the finding",
        "citation": "Cal. Penal Code § 933.05(a)(1)",
        "applies_to": "grand_jury",
        "basis": "2026-10-11 actions-law"
      },
      {
        "status": "finding_disputed",
        "label": "The respondent disagrees wholly or partially with the finding",
        "citation": "Cal. Penal Code § 933.05(a)(2)",
        "applies_to": "grand_jury",
        "basis": "2026-10-11 actions-law"
      },
      {
        "status": "recommendation_implemented",
        "label": "The recommendation has been implemented",
        "citation": "Cal. Penal Code § 933.05(b)(1)",
        "applies_to": "grand_jury",
        "basis": "2026-10-11 actions-law"
      },
      {
        "status": "recommendation_will_be_implemented",
        "label": "The recommendation has not yet been implemented, but will be implemented in the future",
        "citation": "Cal. Penal Code § 933.05(b)(2)",
        "applies_to": "grand_jury",
        "basis": "2026-10-11 actions-law"
      },
      {
        "status": "recommendation_requires_analysis",
        "label": "The recommendation requires further analysis",
        "citation": "Cal. Penal Code § 933.05(b)(3)",
        "applies_to": "grand_jury",
        "basis": "2026-10-11 actions-law"
      },
      {
        "status": "recommendation_not_implemented",
        "label": "The recommendation will not be implemented because it is not warranted or is not reasonable",
        "citation": "Cal. Penal Code § 933.05(b)(4)",
        "applies_to": "grand_jury",
        "basis": "2026-10-11 actions-law"
      }
    ]
  },
  "proceeding_kinds": [
    {
      "kind": "civil",
      "label": "Civil case",
      "forum_kind": "court",
      "basis": "2026-10-25 ccp-411-10, 2026-10-25 alameda-superior-court"
    },
    {
      "kind": "writ",
      "label": "Petition for a writ",
      "forum_kind": "court",
      "basis": "2026-10-25 ccp-1085, 2026-10-25 ccp-1094-5"
    },
    {
      "kind": "appeal",
      "label": "Appeal",
      "forum_kind": "court",
      "basis": "2026-10-25 ccp-904-1, 2026-10-25 first-district-about"
    }
  ],
  "proceeding_flows": [
    {
      "kind": "civil",
      "stages": [
        {
          "stage": "filed",
          "label": "complaint filed",
          "reached_by": [
            "filing"
          ]
        },
        {
          "stage": "decided",
          "label": "judgment or order entered",
          "reached_by": [
            "order"
          ]
        }
      ],
      "citation": "Cal. Code Civ. Proc. §§ 411.10, 904.1(a)",
      "basis": "2026-10-25 ccp-411-10, 2026-10-25 ccp-904-1"
    },
    {
      "kind": "writ",
      "stages": [
        {
          "stage": "filed",
          "label": "petition filed",
          "reached_by": [
            "filing"
          ]
        },
        {
          "stage": "heard",
          "label": "heard by the court",
          "reached_by": [
            "hearing"
          ]
        },
        {
          "stage": "decided",
          "label": "writ granted or denied",
          "reached_by": [
            "order"
          ]
        }
      ],
      "citation": "Cal. Code Civ. Proc. §§ 1085(a), 1094.5(a)",
      "basis": "2026-10-25 ccp-1085, 2026-10-25 ccp-1094-5"
    },
    {
      "kind": "appeal",
      "stages": [
        {
          "stage": "filed",
          "label": "appeal filed",
          "reached_by": [
            "filing"
          ]
        },
        {
          "stage": "decided",
          "label": "appeal decided",
          "reached_by": [
            "order"
          ]
        }
      ],
      "citation": "Cal. Code Civ. Proc. § 904.1(a)",
      "basis": "2026-10-25 ccp-904-1"
    }
  ]
};
