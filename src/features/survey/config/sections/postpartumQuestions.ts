import { QuestionConfig } from "../../components/QuestionRenderer";

export const postpartumWoQuestions: QuestionConfig[] = [
  {
    key: "postpartumWoQ1",
    label: "When did you deliver?",
    labelNp: "तपाईं कहिले सुत्केरी हुनुभएको हो?",
    type: "text",
    inputFormat: "bs-date",
    keyboardType: "number-pad",
    placeholder: "Enter BS date",
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
    labelNp: "तपाईं कहाँ सुत्केरी हुनुभएको हो?",
    type: "select",
    required: true,
    options: [
      { label: "Home", labelNp: "घरमा", value: "H" },
      { label: "Private clinic", labelNp: "निजी क्लिनिक", value: "P" },
      { label: "Public hospital", labelNp: "सरकारी अस्पताल", value: "U" },
      { label: "Health centre", labelNp: "स्वास्थ्य चौकी", value: "C" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
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
      { label: "FWV", labelNp: "स्वास्थ्यकर्मी", value: "F" },
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
    label: "Any complications during delivery?",
    labelNp: "सुत्केरी हुने समयमा समस्या भएको थियो?",
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
    label: "Type of complication",
    labelNp: "कस्तो समस्या भएको थियो?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "postpartumWoQ5", value: "Y" },
    options: [
      { label: "Excessive bleeding", labelNp: "धेरै रगत बगेको", value: "E" },
      { label: "Convulsion", labelNp: "बेहोस वा काप्ने", value: "C" },
      { label: "Prolonged labor", labelNp: "लामो समय व्यथा", value: "P" },
      { label: "Retained placenta", labelNp: "साल नझरेको", value: "R" },
      { label: "Hand/cord prolapse", labelNp: "हात वा नाल बाहिर", value: "H" },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
    validation: [{ type: "required", message: "Select complication" }],
  },

  {
    key: "postpartumWoQ6Others",
    label: "Other complication (specify)",
    labelNp: "अन्य (लेख्नुहोस्)",
    type: "text",
    visibleIf: { dependsOn: "postpartumWoQ6", value: "O" },
    required: true,
    validation: [{ type: "required", message: "Please specify" }],
  },

  {
    key: "postpartumWoQ7",
    label: "Delivery outcome",
    labelNp: "नतिजा के रह्यो?",
    type: "select",
    required: true,
    options: [
      { label: "Live birth", labelNp: "जीवित बच्चा", value: "L" },
      { label: "Still birth", labelNp: "मृत बच्चा", value: "S" },
      { label: "Neonatal death", labelNp: "जन्मेपछि मृत्यु", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "postpartumWoQ8",
    label: "Postnatal check-up (PNC)?",
    labelNp: "सुत्केरी जाँच गराउनुभयो?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "गराएँ", value: "Y" },
      { label: "No", labelNp: "गराएको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },

  {
    key: "postpartumWoQ9",
    label: "Number of PNC visits",
    labelNp: "कति पटक जाँच गराउनुभयो?",
    type: "text",
    visibleIf: { dependsOn: "postpartumWoQ8", value: "Y" },
    required: true,
    validation: [{ type: "required", message: "Enter number" }],
  },

  {
    key: "postpartumWoQ10",
    label: "Any complications after delivery?",
    labelNp: "सुत्केरी पछि समस्या भएको छ?",
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
    label: "Type of complication",
    labelNp: "कस्तो समस्या भएको थियो?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "postpartumWoQ10", value: "Y" },
    options: [
      { label: "Excessive bleeding", labelNp: "धेरै रगत", value: "E" },
      { label: "Convulsion/fits", labelNp: "काप्ने/बेहोस", value: "C" },
      { label: "Foul discharge", labelNp: "गन्हाउने पानी", value: "F" },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
    validation: [{ type: "required", message: "Select complication" }],
  },

  {
    key: "postpartumWoQ11Others",
    label: "Other complication (specify)",
    labelNp: "अन्य (लेख्नुहोस्)",
    type: "text",
    visibleIf: { dependsOn: "postpartumWoQ11", value: "O" },
    required: true,
    validation: [{ type: "required", message: "Please specify" }],
  },

  {
    key: "postpartumWoQ12",
    label: "Blood Pressure",
    labelNp: "रक्तचाप",
    type: "text",
    required: true,
    validation: [{ type: "required", message: "Enter BP" }],
  },

  {
    key: "postpartumWoQ13",
    label: "Blood Glucose",
    labelNp: "रगतमा चिनीको मात्रा",
    type: "text",
    required: true,
    validation: [{ type: "required", message: "Enter glucose level" }],
  },

  {
    key: "postpartumWoQ14",
    label: "Using family planning method?",
    labelNp: "परिवार नियोजन प्रयोग गर्दै हुनुहुन्छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "गरिरहेको छु", value: "Y" },
      { label: "No", labelNp: "गरेको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "This field is required" }],
  },
];
