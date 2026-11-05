import { QuestionConfig } from "../../components/QuestionRenderer";

export const postpartumWoQuestions: QuestionConfig[] = [
  {
    key: "postpartumWoQ1",
    label: "When did you deliver?",
    labelNp: "तपाईं कहिले सुत्केरी हुनुभएको थियो? (बच्चा जन्मेको मिति)",
    type: "text",
    inputFormat: "bs-date",
    dayFirstDisplay: true,
    keyboardType: "number-pad",
    placeholder: "Enter BS date (YYYY-MM-DD)",
    required: true,
    validation: [
      { type: "required", message: "Delivery date is required" },
      {
        type: "pattern",
        value: /^\d{4}-\d{2}-\d{2}$/,
        message: "Enter valid BS date (YYYY-MM-DD)",
      },
    ],
  },

  {
    key: "postpartumWoQ2",
    label: "Where did you deliver?",
    labelNp: "तपाईं कहाँ सुत्केरी हुनुभएको थियो?",
    type: "select",
    required: true,
    options: [
      { label: "Home", labelNp: "घरमा", value: "H" },
      {
        label: "Private hospital/health facility",
        labelNp: "निजी क्लिनिक",
        value: "P",
      },
      {
        label: "Public hospital/health facility",
        labelNp: "सरकारी अस्पताल",
        value: "U",
      },
      { label: "Health centre", labelNp: "स्वास्थ्य चौकी", value: "C" },
    ],
    validation: [
      { type: "required", message: "Please select at least one answer" },
    ],
  },

  {
    key: "postpartumWoQ3",
    label: "Who assisted during delivery?",
    labelNp: "सुत्केरी गराउन कसले सहयोग गरेको थियो?",
    type: "select",
    required: true,
    options: [
      { label: "Doctor", labelNp: "डाक्टर", value: "D" },
      { label: "Nurse", labelNp: "नर्स", value: "N" },
      {
        label: "Health Service Provider",
        labelNp: "स्वास्थ्यकर्मी (Health Service Provider)",
        value: "F",
      },
      { label: "Midwife", labelNp: "अनमी", value: "M" },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "postpartumWoQ4",
    label: "What was the mode of delivery?",
    labelNp: "बच्चा कसरी जन्मिएको थियो?",
    type: "select",
    required: true,
    options: [
      { label: "Normal delivery", labelNp: "सामान्य", value: "N" },
      { label: "C-Section", labelNp: "शल्यक्रिया (अप्रेसन)", value: "C" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "postpartumWoQ5",
    label: "Have you experienced any complications during delivery?",
    labelNp: "सुत्केरी हुने समयमा केही जटिलता वा समस्या भएको थियो?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "थियो", value: "Y" },
      { label: "No", labelNp: "थिएन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "postpartumWoQ6",
    label: "What kind of complication it was?",
    labelNp: "कस्तो प्रकारको समस्या भएको थियो?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "postpartumWoQ5", value: "Y" },
    options: [
      { label: "Excessive bleeding", labelNp: "धेरै रगत बगेको", value: "E" },
      {
        label: "Convulsion",
        labelNp: "काप्ने समस्या / दौरा पर्नु",
        value: "C",
      },
      {
        label: "Prolonged labor",
        labelNp: "लामो समयसम्म व्यथा लागेको",
        value: "P",
      },
      {
        label: "Retained placenta",
        labelNp: "साल नझरेको (साल अड्किएको)",
        value: "R",
      },
      {
        label: "Hand/cord prolapse",
        labelNp: "हात वा नाल पहिले बाहिर निस्किएको",
        value: "H",
      },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
    validation: [{ type: "required", message: "Select complication" }],
  },

  {
    key: "postpartumWoQ6Others",
    label: "Other complication (specify)",
    labelNp: "अन्य (लेख्नुहोस्)",
    type: "text",
    visibleIfAll: [
      { dependsOn: "postpartumWoQ5", value: "Y" },
      { dependsOn: "postpartumWoQ6", value: "O" },
    ],
    required: true,
    validation: [{ type: "required", message: "Please specify" }],
  },

  {
    key: "postpartumWoQ7",
    label: "What was the delivery outcome?",
    labelNp: "सुत्केरीको नतिजा के रह्यो?",
    type: "select",
    required: true,
    options: [
      { label: "Live birth", labelNp: "जीवित बच्चा जन्मेको", value: "L" },
      { label: "Still birth", labelNp: "मृत बच्चा जन्मेको", value: "S" },
      {
        label: "Neonatal death",
        labelNp: "जन्मेपछि बच्चाको मृत्यु भएको",
        value: "N",
      },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "postpartumWoQ8",
    label: "Have you had postnatal check up?",
    labelNp: "के तपाईंले सुत्केरी जाँच (PNC) गराउनुभयो?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "postpartumWoQ7", value: "L" },
    options: [
      { label: "Yes", labelNp: "गराएँ", value: "Y" },
      { label: "No", labelNp: "गराएको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "postpartumWoQ9",
    label: "How many time you had the PNC check-up?",
    labelNp: "तपाईंले कति पटक सुत्केरी जाँच गराउनुभयो? संख्या (पटक)",
    type: "text",
    keyboardType: "number-pad",
    visibleIfAll: [
      { dependsOn: "postpartumWoQ7", value: "L" },
      { dependsOn: "postpartumWoQ8", value: "Y" },
    ],
    required: true,
    validation: [
      { type: "required", message: "Enter number" },
      {
        type: "pattern",
        value: /^\d+$/,
        message: "Enter valid number",
      },
    ],
  },

  {
    key: "postpartumWoQ10",
    label: "Have you experienced any complications after delivery?",
    labelNp: "सुत्केरी भइसकेपछि केही समस्या वा जटिलता भएको छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "postpartumWoQ11",
    label: "What kind of complication it was?",
    labelNp: "कस्तो प्रकारको समस्या भएको थियो?",
    type: "checkbox",
    required: true,
    visibleIf: { dependsOn: "postpartumWoQ10", value: "Y" },
    options: [
      { label: "Excessive bleeding", labelNp: "धेरै रगत बगेको", value: "E" },
      {
        label: "Convulsion/fits",
        labelNp: "बेहोस हुने वा काप्ने समस्या",
        value: "C",
      },
      {
        label: "Foul smelling vaginal discharge",
        labelNp: "योनीबाट गन्हाउने पानी/फोहर बगेको",
        value: "F",
      },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
    validation: [{ type: "required", message: "Select complication" }],
  },

  {
    key: "postpartumWoQ11Others",
    label: "Other complication (specify)",
    labelNp: "अन्य (लेख्नुहोस्)",
    type: "text",
    visibleIfAll: [
      { dependsOn: "postpartumWoQ10", value: "Y" },
      { dependsOn: "postpartumWoQ11", value: "O", operator: "includes" },
    ],
    required: true,
    validation: [{ type: "required", message: "Please specify" }],
  },

  {
    // Local measurement confirmation, excluded from the API payload.
    key: "postpartumWoBpMeasuredByNhf",
    label: "Was blood pressure measured by NHF?",
    labelNp: "के NHF ले रक्तचाप मापन गरेको छ?",
    type: "radio",
    compactChoices: true,
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm whether NHF performed this measurement",
      },
    ],
  },

  {
    key: "postpartumWoQ12",
    label:
      "Blood Pressure (mm of Hg) — If systolic is 140 or higher and/or diastolic is 90 or higher, refer to a health facility",
    labelNp:
      "रक्तचाप (ब्लड प्रेसर) — माथिल्लो १४० वा सोभन्दा बढी र/वा तल्लो ९० वा सोभन्दा बढी भएमा स्वास्थ्य संस्थामा सिफारिस गर्नुहोस्।",
    type: "text",
    visibleIf: { dependsOn: "postpartumWoBpMeasuredByNhf", value: "Y" },
    required: true,
    keyboardType: "number-pad",
    placeholder: "e.g. 120/80",
    validation: [
      {
        type: "pattern",
        value: /^\d{2,3}\/\d{2,3}$/,
        message: "Enter BP like 120/80",
      },
    ],
  },

  {
    // Local measurement confirmation, excluded from the API payload.
    key: "postpartumWoSugarMeasuredByNhf",
    label: "Was blood sugar measured by NHF?",
    labelNp: "के NHF ले रगतमा चिनीको मात्रा मापन गरेको छ?",
    type: "radio",
    compactChoices: true,
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please confirm whether NHF performed this measurement",
      },
    ],
  },

  {
    key: "postpartumWoQ13",
    label:
      "Blood Glucose (mmol/L) — If random blood sugar is above 11.1, refer to a health facility",
    labelNp:
      "रगतमा चिनीको मात्रा (सुगर) — सुगर ११.१ भन्दा बढी भएमा स्वास्थ्य संस्थामा सिफारिस गर्नुहोस्।",
    type: "text",
    visibleIf: { dependsOn: "postpartumWoSugarMeasuredByNhf", value: "Y" },
    required: true,
    keyboardType: "number-pad",
    placeholder: "e.g. 7.2",
    // validation: [{ type: "required", message: "Enter glucose level" }],
  },

  {
    key: "postpartumWoQ14",
    label: "Are you using any family planning method?",
    labelNp: "के तपाईंले परिवार नियोजनको कुनै साधन प्रयोग गरिरहनुभएको छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "गरिरहेको छु", value: "Y" },
      { label: "No", labelNp: "गरेको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },
];
