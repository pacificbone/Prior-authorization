// Added clinical scope for PBJ's frequently discussed and peripheral services.
// A listed procedure or drug is NOT a coverage/medical-necessity/coding determination.
export const EXTRA_PROCEDURES=Object.freeze([
  {
    "id": "trigger-finger",
    "type": "procedure",
    "category": "hand",
    "name": "Trigger finger release (open)",
    "codes": [
      {
        "code": "26055",
        "type": "CPT",
        "label": "Incision of tendon sheath, finger"
      }
    ],
    "description": "Open trigger finger release. Office percutaneous technique may need separate coding confirmation.",
    "checklist": [
      [
        "diagnosis",
        "Triggering or locking and affected digit"
      ],
      [
        "exam",
        "Clinical examination and A1-pulley symptoms"
      ],
      [
        "failed-care",
        "Splinting, injections, duration and response"
      ],
      [
        "technique",
        "Planned release approach and office site"
      ]
    ]
  },
  {
    "id": "trigger-finger-percutaneous",
    "type": "procedure",
    "category": "hand",
    "name": "Percutaneous / ultrasound-guided trigger finger release",
    "codes": [],
    "description": "No automatic CPT assumption: verify payer and device-specific technique coding.",
    "checklist": [
      [
        "diagnosis",
        "Affected digit, examination and stenosing tenosynovitis"
      ],
      [
        "prior-care",
        "Prior treatment and functional limitation"
      ],
      [
        "technique",
        "Technique, ultrasound/device and coding determination"
      ]
    ]
  },
  {
    "id": "knee-meniscectomy",
    "type": "procedure",
    "category": "sports",
    "name": "Arthroscopic partial meniscectomy",
    "codes": [
      {
        "code": "29881",
        "type": "CPT",
        "label": "One compartment meniscectomy"
      }
    ],
    "description": "Do not confuse with meniscus repair or root repair.",
    "checklist": [
      [
        "diagnosis",
        "Clinical and imaging-confirmed meniscus lesion"
      ],
      [
        "symptoms",
        "Mechanical symptoms / functional limitation"
      ],
      [
        "failed-care",
        "Nonsurgical treatment or exception"
      ],
      [
        "technique",
        "Partial meniscectomy versus repair plan"
      ]
    ]
  },
  {
    "id": "meniscus-root",
    "type": "procedure",
    "category": "sports",
    "name": "Meniscus root repair",
    "codes": [],
    "description": "Specific repair, root technique and payer coding require review; do not assume an arthroscopy code is sufficient.",
    "checklist": [
      [
        "lesion",
        "MRI and root tear morphology"
      ],
      [
        "function",
        "Symptoms and clinical findings"
      ],
      [
        "management",
        "Conservative-treatment history or reason to operate"
      ],
      [
        "plan",
        "Root fixation technique and ancillary procedures"
      ]
    ]
  },
  {
    "id": "bear-acl",
    "type": "procedure",
    "category": "sports",
    "name": "BEAR ACL repair / implant",
    "codes": [],
    "description": "Confirm implant-specific coding and payer coverage; not the same as routine ACL reconstruction.",
    "checklist": [
      [
        "diagnosis",
        "ACL tear and imaging"
      ],
      [
        "timing",
        "Time from injury and eligibility for device"
      ],
      [
        "assessment",
        "Instability and ACL tissue condition"
      ],
      [
        "device",
        "Device indication, surgeon plan and product authorization"
      ]
    ]
  },
  {
    "id": "cartiheal",
    "type": "procedure",
    "category": "cartilage",
    "name": "Agili-C / CartiHeal osteochondral implant",
    "codes": [],
    "description": "Device-specific and site-specific code / implant authorization must be reviewed.",
    "checklist": [
      [
        "lesion",
        "Lesion size, location and grade"
      ],
      [
        "imaging",
        "Imaging / surgical confirmation"
      ],
      [
        "alignment",
        "Meniscus, alignment and stability"
      ],
      [
        "treatment",
        "Prior treatment and implant plan"
      ]
    ]
  },
  {
    "id": "osteochondral-allograft",
    "type": "procedure",
    "category": "cartilage",
    "name": "Osteochondral allograft transplantation",
    "codes": [],
    "description": "Confirm joint/site, approach, graft procurement and payer-specific codes.",
    "checklist": [
      [
        "lesion",
        "Defect size and location"
      ],
      [
        "imaging",
        "MRI and radiographs"
      ],
      [
        "prior-care",
        "Conservative and prior operations"
      ],
      [
        "graft",
        "Allograft indication and procurement plan"
      ]
    ]
  },
  {
    "id": "maci-cell-product",
    "type": "procedure",
    "category": "cartilage",
    "name": "MACI stage 3: cultured chondrocyte cell product (J7330) authorization",
    "codes": [
      {
        "code": "J7330",
        "type": "HCPCS",
        "label": "Autologous cultured chondrocytes, implant (per implant; verify units for lesion count and size)"
      }
    ],
    "description": "Separate authorization and procurement review for the cultured cell product itself. Approval of harvest (S2112) or implantation (27412) does not authorize or pay for J7330, and the product benefit channel (medical buy-and-bill versus specialty pharmacy or manufacturer-direct supply) varies by payer.",
    "checklist": [
      [
        "biopsy",
        "Completed stage 1 biopsy/harvest date and stored-cell status"
      ],
      [
        "lesion",
        "Lesion count, location and size supporting the number of implants ordered"
      ],
      [
        "benefit",
        "Medical versus pharmacy benefit for J7330 and who may purchase and bill the product"
      ],
      [
        "fabrication",
        "Manufacturer order/fabrication authorization and delivery site arrangements"
      ],
      [
        "implantAuth",
        "Separate implantation (27412) professional and facility authorization status"
      ]
    ]
  },
  {
    "id": "knee-osteotomy",
    "type": "procedure",
    "category": "sports",
    "name": "High tibial / femoral osteotomy",
    "codes": [],
    "description": "Code and device details depend on bone and osteotomy technique.",
    "checklist": [
      [
        "alignment",
        "Standing long-leg radiographs / deformity"
      ],
      [
        "arthritis",
        "Compartment status and joint preservation"
      ],
      [
        "failed-care",
        "Nonoperative treatment"
      ],
      [
        "plan",
        "Correction goal and implant plan"
      ]
    ]
  },
  {
    "id": "si-joint-fusion",
    "type": "procedure",
    "category": "spine",
    "name": "Minimally invasive SI joint fusion",
    "codes": [
      {
        "code": "27279",
        "type": "CPT",
        "label": "Minimally invasive SI joint arthrodesis with transfixation device(s) piercing the iliac and sacral cortices (verify 2026 descriptor)"
      },
      {
        "code": "27278",
        "type": "CPT",
        "label": "SI joint stabilization with intra-articular implant(s) WITHOUT transfixation (Noridian L39810: not reasonable and necessary for Original Medicare; verify 2026 descriptor)"
      }
    ],
    "description": "Codes are candidates only and the 2026 CPT descriptors were revised; the technique (transfixation versus intra-articular-only) drives both the code and payer coverage. Surgical criteria require the exact payer policy; no universal PA rule.",
    "checklist": [
      [
        "diagnosis",
        "SI joint pain diagnosis and provocative findings"
      ],
      [
        "injections",
        "Diagnostic blocks / response per payer"
      ],
      [
        "care",
        "PT, medications and other conservative care"
      ],
      [
        "imaging",
        "Imaging and alternate pain generator evaluation"
      ],
      [
        "device",
        "Implant approach and place of service"
      ]
    ]
  },
  {
    "id": "pns-knee",
    "type": "procedure",
    "category": "pain",
    "name": "Peripheral nerve stimulation after knee replacement",
    "codes": [],
    "description": "Evaluate temporary/permanent lead type, implantation technique, benefit and any device code separately.",
    "checklist": [
      [
        "indication",
        "Persistent chronic postoperative pain and functional impact"
      ],
      [
        "exclusion",
        "Exclude infection, loosening, instability or other mechanical cause"
      ],
      [
        "failed-care",
        "Medication, rehabilitation and other treatment response"
      ],
      [
        "plan",
        "Target nerve, trial versus implantation, device, outcome criteria"
      ]
    ]
  },
  {
    "id": "iovera",
    "type": "procedure",
    "category": "pain",
    "name": "Cryoneurolysis (iovera) before/after knee surgery",
    "codes": [],
    "description": "Target nerves and billing code depend on clinical application; payer-specific review.",
    "checklist": [
      [
        "indication",
        "Pain distribution and clinical diagnosis"
      ],
      [
        "treatment",
        "Prior conservative treatments"
      ],
      [
        "targets",
        "Target nerve and image/landmark guidance"
      ],
      [
        "timing",
        "Timing relative to arthroplasty and intended outcomes"
      ]
    ]
  },
  {
    "id": "genicular-rfa",
    "type": "procedure",
    "category": "pain",
    "name": "Genicular nerve radiofrequency ablation",
    "codes": [
      {
        "code": "64624",
        "type": "CPT",
        "label": "Genicular nerve branch destruction"
      }
    ],
    "description": "Verify medical necessity, whether coverage is limited and diagnostic blocks.",
    "checklist": [
      [
        "diagnosis",
        "Knee OA or chronic pain diagnosis"
      ],
      [
        "failed-care",
        "Failed conservative care and injections"
      ],
      [
        "blocks",
        "Diagnostic nerve block results if required"
      ],
      [
        "procedure",
        "Targets, modality and follow-up plan"
      ]
    ]
  },
  {
    "id": "prp",
    "type": "procedure",
    "category": "injections",
    "name": "Platelet-rich plasma (PRP) injection",
    "codes": [],
    "description": "Often coverage-limited or noncovered; confirm exact plan policy and separate self-pay estimate.",
    "checklist": [
      [
        "diagnosis",
        "Diagnosis and site"
      ],
      [
        "treatment",
        "Prior measures and rationale"
      ],
      [
        "consent",
        "Evidence/coverage discussion and consent"
      ],
      [
        "plan",
        "Preparation, site and number of treatments"
      ]
    ]
  },
  {
    "id": "bmac",
    "type": "procedure",
    "category": "injections",
    "name": "Bone marrow aspirate concentrate (BMAC)",
    "codes": [],
    "description": "Regenerative product/services require explicit medical-policy and coding review.",
    "checklist": [
      [
        "diagnosis",
        "Clinical indication and site"
      ],
      [
        "history",
        "Prior treatment and severity"
      ],
      [
        "procedure",
        "Bone marrow harvest and injection plan"
      ],
      [
        "coverage",
        "Investigational/noncovered status verified with the payer"
      ]
    ]
  },
  {
    "id": "a2m",
    "type": "procedure",
    "category": "injections",
    "name": "Alpha-2-macroglobulin (A2M) injection",
    "codes": [],
    "description": "Investigational/noncovered policies and device coding must be checked before any cost promise.",
    "checklist": [
      [
        "diagnosis",
        "Condition and treatment rationale"
      ],
      [
        "history",
        "Prior conservative treatments"
      ],
      [
        "product",
        "Product, source and service plan"
      ],
      [
        "benefit",
        "Payer investigational policy / self-pay discussion"
      ]
    ]
  },
  {
    "id": "corticosteroid-injection",
    "type": "procedure",
    "category": "injections",
    "name": "Corticosteroid joint injection",
    "codes": [
      {
        "code": "20610",
        "type": "CPT",
        "label": "Large joint injection without ultrasound"
      },
      {
        "code": "20611",
        "type": "CPT",
        "label": "Large joint injection with ultrasound"
      }
    ],
    "description": "Check specific joint, site, drug J-code and frequency; procedure and drug may bill separately.",
    "checklist": [
      [
        "diagnosis",
        "Joint diagnosis/laterality"
      ],
      [
        "exam",
        "Exam and clinical symptoms"
      ],
      [
        "treatment",
        "Prior injections and timing"
      ],
      [
        "drug",
        "Drug, dose and guidance documentation"
      ]
    ]
  },
  {
    "id": "ultrasound-diagnostic",
    "type": "procedure",
    "category": "imaging",
    "name": "Diagnostic extremity ultrasound",
    "codes": [
      {
        "code": "76882",
        "type": "CPT",
        "label": "Limited extremity ultrasound"
      }
    ],
    "description": "Complete versus limited and indication require coding review.",
    "checklist": [
      [
        "diagnosis",
        "Reason for diagnostic imaging"
      ],
      [
        "findings",
        "Clinical exam / diagnostic question"
      ],
      [
        "site",
        "Anatomic region and technique"
      ],
      [
        "report",
        "Interpretation, images and written report"
      ]
    ]
  },
  {
    "id": "mri-knee",
    "type": "procedure",
    "category": "imaging",
    "name": "MRI knee without contrast",
    "codes": [
      {
        "code": "73721",
        "type": "CPT",
        "label": "MRI lower extremity joint without contrast"
      }
    ],
    "description": "Site and protocol must match clinical question; facility and radiologist may bill separately.",
    "checklist": [
      [
        "symptoms",
        "Symptoms and functional impact"
      ],
      [
        "exam",
        "Relevant clinical examination"
      ],
      [
        "radiographs",
        "Prior imaging and findings"
      ],
      [
        "question",
        "Specific clinical question to be answered"
      ]
    ]
  },
  {
    "id": "xray-knee",
    "type": "procedure",
    "category": "imaging",
    "name": "Knee radiographs",
    "codes": [
      {
        "code": "73562",
        "type": "CPT",
        "label": "Knee X-ray, three views (example)"
      }
    ],
    "description": "Code depends on exact views and laterality.",
    "checklist": [
      [
        "diagnosis",
        "Indication"
      ],
      [
        "views",
        "Requested views and side"
      ],
      [
        "findings",
        "Relevant clinical documentation"
      ]
    ]
  },
  {
    "id": "dexa",
    "type": "procedure",
    "category": "imaging",
    "name": "DXA bone density scan",
    "codes": [
      {
        "code": "77080",
        "type": "CPT",
        "label": "Central DXA"
      }
    ],
    "description": "Frequency and osteoporosis risk conditions may vary by plan.",
    "checklist": [
      [
        "risk",
        "Age, fracture risk and indication"
      ],
      [
        "history",
        "Prior DXA and treatment history"
      ],
      [
        "frequency",
        "Interval since last covered scan"
      ]
    ]
  },
  {
    "id": "dme-brace",
    "type": "procedure",
    "category": "support",
    "name": "Custom knee brace / DME",
    "codes": [],
    "description": "Exact L-code, custom-fitted vs custom-fabricated and DME benefit require plan-specific verification.",
    "checklist": [
      [
        "diagnosis",
        "Instability or OA diagnosis"
      ],
      [
        "exam",
        "Joint exam and need"
      ],
      [
        "failed-care",
        "Other supports or care"
      ],
      [
        "device",
        "Specific device and fitting documentation"
      ]
    ]
  },
  {
    "id": "office-pt",
    "type": "procedure",
    "category": "support",
    "name": "Outpatient physical therapy / rehabilitation",
    "codes": [],
    "description": "Visit limits, authorization, time-based billing and network status differ by plan.",
    "checklist": [
      [
        "diagnosis",
        "Functional diagnosis"
      ],
      [
        "evaluation",
        "PT evaluation and objective impairments"
      ],
      [
        "goals",
        "Measurable plan of care"
      ],
      [
        "frequency",
        "Frequency, visits and medical necessity"
      ]
    ]
  },
  {
    "id": "core-decompression",
    "type": "procedure",
    "category": "arthroplasty",
    "name": "Femoral head core decompression",
    "codes": [],
    "description": "Verify coding, graft/biologic, osteonecrosis stage and facility coverage.",
    "checklist": [
      [
        "imaging",
        "MRI/AVN stage"
      ],
      [
        "symptoms",
        "Symptoms and function"
      ],
      [
        "rationale",
        "Joint preservation versus THA"
      ],
      [
        "plan",
        "Technique, grafting and setting"
      ]
    ]
  },
  {
    "id": "osseointegration",
    "type": "procedure",
    "category": "arthroplasty",
    "name": "Tibia / femur osseointegration",
    "codes": [],
    "description": "Specialty staged implant procedure, clinical indication and negotiated facility/professional coding require manual authorization review.",
    "checklist": [
      [
        "indication",
        "Limb deficiency and prior prosthetic experience"
      ],
      [
        "evaluation",
        "Bone/soft-tissue assessment and imaging"
      ],
      [
        "team",
        "Multidisciplinary candidacy and rehabilitation"
      ],
      [
        "plan",
        "Staged implant and costs"
      ]
    ]
  }
]);
export const EXTRA_DRUGS=Object.freeze([
  {
    "id": "celecoxib",
    "name": "Celecoxib",
    "generic": "Celebrex",
    "category": "Pain / anti-inflammatory"
  },
  {
    "id": "meloxicam",
    "name": "Meloxicam",
    "generic": "Mobic",
    "category": "Pain / anti-inflammatory"
  },
  {
    "id": "diclofenac",
    "name": "Diclofenac",
    "generic": "Voltaren",
    "category": "Pain / anti-inflammatory"
  },
  {
    "id": "naproxen",
    "name": "Naproxen",
    "generic": "Naprosyn",
    "category": "Pain / anti-inflammatory"
  },
  {
    "id": "gabapentin",
    "name": "Gabapentin",
    "generic": "Neurontin",
    "category": "Neuropathic pain"
  },
  {
    "id": "pregabalin",
    "name": "Pregabalin",
    "generic": "Lyrica",
    "category": "Neuropathic pain"
  },
  {
    "id": "duloxetine",
    "name": "Duloxetine",
    "generic": "Cymbalta",
    "category": "Neuropathic pain"
  },
  {
    "id": "tramadol",
    "name": "Tramadol",
    "generic": "Ultram",
    "category": "Postoperative analgesia"
  },
  {
    "id": "oxycodone",
    "name": "Oxycodone",
    "generic": "Roxicodone",
    "category": "Postoperative analgesia"
  },
  {
    "id": "acetaminophen",
    "name": "Acetaminophen",
    "generic": "Tylenol",
    "category": "Pain / anti-inflammatory"
  },
  {
    "id": "aspirin",
    "name": "Aspirin",
    "generic": "ASA",
    "category": "VTE prophylaxis / pain"
  },
  {
    "id": "apixaban",
    "name": "Apixaban",
    "generic": "Eliquis",
    "category": "VTE prophylaxis"
  },
  {
    "id": "rivaroxaban",
    "name": "Rivaroxaban",
    "generic": "Xarelto",
    "category": "VTE prophylaxis"
  },
  {
    "id": "tranexamic-acid",
    "name": "Tranexamic acid",
    "generic": "Lysteda / TXA",
    "category": "Perioperative medication"
  },
  {
    "id": "methylprednisolone",
    "name": "Methylprednisolone",
    "generic": "Medrol Dosepak",
    "category": "Corticosteroid"
  },
  {
    "id": "ondansetron",
    "name": "Ondansetron",
    "generic": "Zofran",
    "category": "Antiemetic"
  },
  {
    "id": "cephalexin",
    "name": "Cephalexin",
    "generic": "Keflex",
    "category": "Perioperative antibiotic"
  },
  {
    "id": "methocarbamol",
    "name": "Methocarbamol",
    "generic": "Robaxin",
    "category": "Muscle relaxant"
  },
  {
    "id": "ibuprofen",
    "name": "Ibuprofen",
    "generic": "Advil / Motrin",
    "category": "Pain / anti-inflammatory"
  },
  {
    "id": "lidocaine",
    "name": "Lidocaine",
    "generic": "Xylocaine",
    "category": "Local anesthetic"
  },
  {
    "id": "bupivacaine",
    "name": "Bupivacaine",
    "generic": "Marcaine / Exparel is a distinct liposomal product",
    "category": "Local anesthetic"
  },
  {
    "id": "exparel",
    "name": "Exparel",
    "generic": "Liposomal bupivacaine",
    "category": "Long-acting local anesthetic"
  },
  {
    "id": "ibandronate",
    "name": "Ibandronate",
    "generic": "Boniva",
    "category": "Bone health"
  },
  {
    "id": "risedronate",
    "name": "Risedronate",
    "generic": "Actonel",
    "category": "Bone health"
  },
  {
    "id": "romosozumab",
    "name": "Romosozumab",
    "generic": "Evenity (same molecule)",
    "category": "Bone health"
  },
  {
    "id": "calcitonin",
    "name": "Calcitonin salmon",
    "generic": "Miacalcin",
    "category": "Bone health"
  }
]);
