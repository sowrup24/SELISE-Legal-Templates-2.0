/* Contract templates, copied from TPL in preview/new-contract-flow.html.
   Text placeholders like {name} refer to a field key. */

export type TemplateField = {
  k: string
  label: string
  req?: number
  group: string
  role?: string
  type?: string
  options?: string[]
  v?: string
}

export type Template = {
  id: string
  name: string
  alias?: string
  cat: string
  /** Month the template was last reviewed, for example "Sep 2026". */
  upd: string
  used?: string
  /** Minutes it takes to fill in. */
  time: number
  desc: string
  fields: TemplateField[]
  partyRole: string
  text: string[]
}

export const TEMPLATES: Template[] = [
  {
    "id": "nda",
    "name": "Non-disclosure agreement",
    "alias": "NDA",
    "cat": "Employment",
    "upd": "Sep 2026",
    "used": "Used today",
    "time": 5,
    "desc": "Keeps company information confidential. Use it for new employees before their first day.",
    "fields": [
      {
        "k": "company",
        "label": "Company",
        "req": 1,
        "group": "Parties",
        "v": "SELISE AG"
      },
      {
        "k": "companyAddress",
        "label": "Company address",
        "req": 1,
        "group": "Parties",
        "v": "Seestrasse 1, 8002 Zurich"
      },
      {
        "k": "name",
        "label": "Employee name",
        "req": 1,
        "group": "Parties",
        "role": "name"
      },
      {
        "k": "email",
        "label": "Employee email",
        "req": 1,
        "group": "Parties",
        "role": "email",
        "type": "email"
      },
      {
        "k": "address",
        "label": "Employee address",
        "req": 1,
        "group": "Parties"
      },
      {
        "k": "start",
        "label": "Start date",
        "req": 1,
        "group": "Dates and terms",
        "type": "date"
      },
      {
        "k": "period",
        "label": "Confidentiality period",
        "req": 1,
        "group": "Dates and terms",
        "options": [
          "1 year",
          "2 years",
          "3 years",
          "5 years"
        ],
        "v": "3 years"
      },
      {
        "k": "place",
        "label": "Place of jurisdiction",
        "req": 1,
        "group": "Dates and terms"
      }
    ],
    "partyRole": "Employee",
    "text": [
      "This agreement is made between {company}, {companyAddress} (the Company) and {name}, {address} (the Employee).",
      "1. Purpose. As part of the employment starting on {start}, the Employee will receive confidential information about the Company, its clients and its partners.",
      "2. Confidential information. Confidential information means all non-public information, in any form, that the Employee receives from the Company or learns during the employment.",
      "3. Obligations. The Employee keeps confidential information secret, uses it only for their work for the Company and does not share it with third parties.",
      "4. Duration. The obligations last during the employment and for {period} after it ends.",
      "5. Law and jurisdiction. This agreement is governed by Swiss law. The place of jurisdiction is {place}."
    ]
  },
  {
    "id": "emp",
    "name": "Employment contract",
    "cat": "Employment",
    "upd": "Sep 2026",
    "used": "Used 2 days ago",
    "time": 8,
    "desc": "Permanent or fixed-term employment under Swiss law.",
    "fields": [
      {
        "k": "company",
        "label": "Company",
        "req": 1,
        "group": "Parties",
        "v": "SELISE AG"
      },
      {
        "k": "companyAddress",
        "label": "Company address",
        "req": 1,
        "group": "Parties",
        "v": "Seestrasse 1, 8002 Zurich"
      },
      {
        "k": "name",
        "label": "Employee name",
        "req": 1,
        "group": "Parties",
        "role": "name"
      },
      {
        "k": "email",
        "label": "Employee email",
        "req": 1,
        "group": "Parties",
        "role": "email",
        "type": "email"
      },
      {
        "k": "role",
        "label": "Job title",
        "req": 1,
        "group": "Work"
      },
      {
        "k": "start",
        "label": "Start date",
        "req": 1,
        "group": "Work",
        "type": "date"
      },
      {
        "k": "salary",
        "label": "Yearly salary (CHF)",
        "req": 1,
        "group": "Work"
      },
      {
        "k": "workplace",
        "label": "Workplace",
        "req": 0,
        "group": "Work",
        "v": "Zurich"
      }
    ],
    "partyRole": "Employee",
    "text": [
      "This employment contract is made between {company}, {companyAddress} (the Employer) and {name} (the Employee).",
      "1. Position. The Employee is employed as {role}, starting on {start}. The usual place of work is {workplace}.",
      "2. Salary. The yearly gross salary is CHF {salary}, paid in 13 monthly instalments.",
      "3. Working time and holidays. Working time is 42 hours a week. The Employee has 25 days of paid holiday a year.",
      "4. Law. This contract is governed by the Swiss Code of Obligations."
    ]
  },
  {
    "id": "term",
    "name": "Termination agreement",
    "cat": "Employment",
    "upd": "Aug 2026",
    "used": "Used last week",
    "time": 6,
    "desc": "Ends an employment by mutual agreement, with notice and final pay.",
    "fields": [
      {
        "k": "company",
        "label": "Company",
        "req": 1,
        "group": "Parties",
        "v": "SELISE AG"
      },
      {
        "k": "companyAddress",
        "label": "Company address",
        "req": 1,
        "group": "Parties",
        "v": "Seestrasse 1, 8002 Zurich"
      },
      {
        "k": "name",
        "label": "Other party",
        "req": 1,
        "group": "Parties",
        "role": "name"
      },
      {
        "k": "email",
        "label": "Other party email",
        "req": 1,
        "group": "Parties",
        "role": "email",
        "type": "email"
      },
      {
        "k": "start",
        "label": "Start date",
        "req": 1,
        "group": "Dates and terms",
        "type": "date"
      },
      {
        "k": "place",
        "label": "Place of jurisdiction",
        "req": 0,
        "group": "Dates and terms",
        "v": "Zurich"
      }
    ],
    "partyRole": "Other party",
    "text": [
      "This termination agreement is made between {company}, {companyAddress} and {name}.",
      "1. Subject. Ends an employment by mutual agreement, with notice and final pay.",
      "2. Start. This agreement starts on {start}.",
      "3. Law and jurisdiction. This agreement is governed by Swiss law. The place of jurisdiction is {place}."
    ]
  },
  {
    "id": "intern",
    "name": "Internship contract",
    "cat": "Employment",
    "upd": "Jul 2026",
    "time": 5,
    "desc": "Duration, salary and learning goals for an intern.",
    "fields": [
      {
        "k": "company",
        "label": "Company",
        "req": 1,
        "group": "Parties",
        "v": "SELISE AG"
      },
      {
        "k": "companyAddress",
        "label": "Company address",
        "req": 1,
        "group": "Parties",
        "v": "Seestrasse 1, 8002 Zurich"
      },
      {
        "k": "name",
        "label": "Other party",
        "req": 1,
        "group": "Parties",
        "role": "name"
      },
      {
        "k": "email",
        "label": "Other party email",
        "req": 1,
        "group": "Parties",
        "role": "email",
        "type": "email"
      },
      {
        "k": "start",
        "label": "Start date",
        "req": 1,
        "group": "Dates and terms",
        "type": "date"
      },
      {
        "k": "place",
        "label": "Place of jurisdiction",
        "req": 0,
        "group": "Dates and terms",
        "v": "Zurich"
      }
    ],
    "partyRole": "Other party",
    "text": [
      "This internship contract is made between {company}, {companyAddress} and {name}.",
      "1. Subject. Duration, salary and learning goals for an intern.",
      "2. Start. This agreement starts on {start}.",
      "3. Law and jurisdiction. This agreement is governed by Swiss law. The place of jurisdiction is {place}."
    ]
  },
  {
    "id": "consult",
    "name": "Consulting agreement",
    "cat": "Business",
    "upd": "Sep 2026",
    "time": 7,
    "desc": "Scope, fees and deliverables for an external consultant.",
    "fields": [
      {
        "k": "company",
        "label": "Company",
        "req": 1,
        "group": "Parties",
        "v": "SELISE AG"
      },
      {
        "k": "companyAddress",
        "label": "Company address",
        "req": 1,
        "group": "Parties",
        "v": "Seestrasse 1, 8002 Zurich"
      },
      {
        "k": "name",
        "label": "Other party",
        "req": 1,
        "group": "Parties",
        "role": "name"
      },
      {
        "k": "email",
        "label": "Other party email",
        "req": 1,
        "group": "Parties",
        "role": "email",
        "type": "email"
      },
      {
        "k": "start",
        "label": "Start date",
        "req": 1,
        "group": "Dates and terms",
        "type": "date"
      },
      {
        "k": "place",
        "label": "Place of jurisdiction",
        "req": 0,
        "group": "Dates and terms",
        "v": "Zurich"
      }
    ],
    "partyRole": "Other party",
    "text": [
      "This consulting agreement is made between {company}, {companyAddress} and {name}.",
      "1. Subject. Scope, fees and deliverables for an external consultant.",
      "2. Start. This agreement starts on {start}.",
      "3. Law and jurisdiction. This agreement is governed by Swiss law. The place of jurisdiction is {place}."
    ]
  },
  {
    "id": "service",
    "name": "Service agreement",
    "cat": "Business",
    "upd": "Jun 2026",
    "time": 8,
    "desc": "Services your company provides to a client, with terms and fees.",
    "fields": [
      {
        "k": "company",
        "label": "Company",
        "req": 1,
        "group": "Parties",
        "v": "SELISE AG"
      },
      {
        "k": "companyAddress",
        "label": "Company address",
        "req": 1,
        "group": "Parties",
        "v": "Seestrasse 1, 8002 Zurich"
      },
      {
        "k": "name",
        "label": "Other party",
        "req": 1,
        "group": "Parties",
        "role": "name"
      },
      {
        "k": "email",
        "label": "Other party email",
        "req": 1,
        "group": "Parties",
        "role": "email",
        "type": "email"
      },
      {
        "k": "start",
        "label": "Start date",
        "req": 1,
        "group": "Dates and terms",
        "type": "date"
      },
      {
        "k": "place",
        "label": "Place of jurisdiction",
        "req": 0,
        "group": "Dates and terms",
        "v": "Zurich"
      }
    ],
    "partyRole": "Other party",
    "text": [
      "This service agreement is made between {company}, {companyAddress} and {name}.",
      "1. Subject. Services your company provides to a client, with terms and fees.",
      "2. Start. This agreement starts on {start}.",
      "3. Law and jurisdiction. This agreement is governed by Swiss law. The place of jurisdiction is {place}."
    ]
  },
  {
    "id": "share",
    "name": "Shareholder agreement",
    "cat": "Corporate",
    "upd": "May 2026",
    "time": 12,
    "desc": "Rights and duties of the shareholders of a company.",
    "fields": [
      {
        "k": "company",
        "label": "Company",
        "req": 1,
        "group": "Parties",
        "v": "SELISE AG"
      },
      {
        "k": "companyAddress",
        "label": "Company address",
        "req": 1,
        "group": "Parties",
        "v": "Seestrasse 1, 8002 Zurich"
      },
      {
        "k": "name",
        "label": "Other party",
        "req": 1,
        "group": "Parties",
        "role": "name"
      },
      {
        "k": "email",
        "label": "Other party email",
        "req": 1,
        "group": "Parties",
        "role": "email",
        "type": "email"
      },
      {
        "k": "start",
        "label": "Start date",
        "req": 1,
        "group": "Dates and terms",
        "type": "date"
      },
      {
        "k": "place",
        "label": "Place of jurisdiction",
        "req": 0,
        "group": "Dates and terms",
        "v": "Zurich"
      }
    ],
    "partyRole": "Other party",
    "text": [
      "This shareholder agreement is made between {company}, {companyAddress} and {name}.",
      "1. Subject. Rights and duties of the shareholders of a company.",
      "2. Start. This agreement starts on {start}.",
      "3. Law and jurisdiction. This agreement is governed by Swiss law. The place of jurisdiction is {place}."
    ]
  },
  {
    "id": "dpa",
    "name": "Data processing agreement",
    "cat": "Compliance",
    "upd": "Sep 2026",
    "time": 10,
    "desc": "How a supplier handles personal data on your behalf (nDSG, GDPR).",
    "fields": [
      {
        "k": "company",
        "label": "Company",
        "req": 1,
        "group": "Parties",
        "v": "SELISE AG"
      },
      {
        "k": "companyAddress",
        "label": "Company address",
        "req": 1,
        "group": "Parties",
        "v": "Seestrasse 1, 8002 Zurich"
      },
      {
        "k": "name",
        "label": "Other party",
        "req": 1,
        "group": "Parties",
        "role": "name"
      },
      {
        "k": "email",
        "label": "Other party email",
        "req": 1,
        "group": "Parties",
        "role": "email",
        "type": "email"
      },
      {
        "k": "start",
        "label": "Start date",
        "req": 1,
        "group": "Dates and terms",
        "type": "date"
      },
      {
        "k": "place",
        "label": "Place of jurisdiction",
        "req": 0,
        "group": "Dates and terms",
        "v": "Zurich"
      }
    ],
    "partyRole": "Other party",
    "text": [
      "This data processing agreement is made between {company}, {companyAddress} and {name}.",
      "1. Subject. How a supplier handles personal data on your behalf (nDSG, GDPR).",
      "2. Start. This agreement starts on {start}.",
      "3. Law and jurisdiction. This agreement is governed by Swiss law. The place of jurisdiction is {place}."
    ]
  },
  {
    "id": "licence",
    "name": "Licence agreement",
    "cat": "Intellectual property",
    "upd": "Apr 2026",
    "time": 7,
    "desc": "Lets another party use your software, brand or content.",
    "fields": [
      {
        "k": "company",
        "label": "Company",
        "req": 1,
        "group": "Parties",
        "v": "SELISE AG"
      },
      {
        "k": "companyAddress",
        "label": "Company address",
        "req": 1,
        "group": "Parties",
        "v": "Seestrasse 1, 8002 Zurich"
      },
      {
        "k": "name",
        "label": "Other party",
        "req": 1,
        "group": "Parties",
        "role": "name"
      },
      {
        "k": "email",
        "label": "Other party email",
        "req": 1,
        "group": "Parties",
        "role": "email",
        "type": "email"
      },
      {
        "k": "start",
        "label": "Start date",
        "req": 1,
        "group": "Dates and terms",
        "type": "date"
      },
      {
        "k": "place",
        "label": "Place of jurisdiction",
        "req": 0,
        "group": "Dates and terms",
        "v": "Zurich"
      }
    ],
    "partyRole": "Other party",
    "text": [
      "This licence agreement is made between {company}, {companyAddress} and {name}.",
      "1. Subject. Lets another party use your software, brand or content.",
      "2. Start. This agreement starts on {start}.",
      "3. Law and jurisdiction. This agreement is governed by Swiss law. The place of jurisdiction is {place}."
    ]
  },
  {
    "id": "loan",
    "name": "Loan agreement",
    "cat": "Finance",
    "upd": "Mar 2026",
    "time": 6,
    "desc": "Amount, interest and repayment of a loan.",
    "fields": [
      {
        "k": "company",
        "label": "Company",
        "req": 1,
        "group": "Parties",
        "v": "SELISE AG"
      },
      {
        "k": "companyAddress",
        "label": "Company address",
        "req": 1,
        "group": "Parties",
        "v": "Seestrasse 1, 8002 Zurich"
      },
      {
        "k": "name",
        "label": "Other party",
        "req": 1,
        "group": "Parties",
        "role": "name"
      },
      {
        "k": "email",
        "label": "Other party email",
        "req": 1,
        "group": "Parties",
        "role": "email",
        "type": "email"
      },
      {
        "k": "start",
        "label": "Start date",
        "req": 1,
        "group": "Dates and terms",
        "type": "date"
      },
      {
        "k": "place",
        "label": "Place of jurisdiction",
        "req": 0,
        "group": "Dates and terms",
        "v": "Zurich"
      }
    ],
    "partyRole": "Other party",
    "text": [
      "This loan agreement is made between {company}, {companyAddress} and {name}.",
      "1. Subject. Amount, interest and repayment of a loan.",
      "2. Start. This agreement starts on {start}.",
      "3. Law and jurisdiction. This agreement is governed by Swiss law. The place of jurisdiction is {place}."
    ]
  },
  {
    "id": "lease",
    "name": "Office lease",
    "cat": "Real estate",
    "upd": "Feb 2026",
    "time": 9,
    "desc": "Renting office space, with rent, duration and notice.",
    "fields": [
      {
        "k": "company",
        "label": "Company",
        "req": 1,
        "group": "Parties",
        "v": "SELISE AG"
      },
      {
        "k": "companyAddress",
        "label": "Company address",
        "req": 1,
        "group": "Parties",
        "v": "Seestrasse 1, 8002 Zurich"
      },
      {
        "k": "name",
        "label": "Other party",
        "req": 1,
        "group": "Parties",
        "role": "name"
      },
      {
        "k": "email",
        "label": "Other party email",
        "req": 1,
        "group": "Parties",
        "role": "email",
        "type": "email"
      },
      {
        "k": "start",
        "label": "Start date",
        "req": 1,
        "group": "Dates and terms",
        "type": "date"
      },
      {
        "k": "place",
        "label": "Place of jurisdiction",
        "req": 0,
        "group": "Dates and terms",
        "v": "Zurich"
      }
    ],
    "partyRole": "Other party",
    "text": [
      "This office lease is made between {company}, {companyAddress} and {name}.",
      "1. Subject. Renting office space, with rent, duration and notice.",
      "2. Start. This agreement starts on {start}.",
      "3. Law and jurisdiction. This agreement is governed by Swiss law. The place of jurisdiction is {place}."
    ]
  }
]

export const CATEGORIES = ['All templates', ...new Set(TEMPLATES.map((t) => t.cat))]
