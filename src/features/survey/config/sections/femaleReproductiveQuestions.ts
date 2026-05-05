import { QuestionConfig } from "../../components/QuestionRenderer";

export const feReproductiveQuestions: QuestionConfig[] = [
  {
    key: "feReproductiveQ1",
    label: "Have you had menstruation in last 45 days/6 weeks?",
    labelNp: "के तपाईंलाई पछिल्लो ४५ दिन वा ६ हप्ताभित्र महिनावारी भएको छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "feReproductiveQ2",
    label: "Have you done pregnancy test?",
    labelNp: "के तपाईंले गर्भ जाँच गर्नुभयो?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "गरें", value: "Y" },
      { label: "No", labelNp: "गरेको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "feReproductiveQ3",
    label: "Are you pregnant?",
    labelNp: "के तपाईं गर्भवती हुनुहुन्छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "छु", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  // ---------- Menstrual hygiene ----------
  {
    key: "feReproductiveQ4",
    label: "What kind of menstrual product you use?",
    labelNp: "महिनावारी हुँदा के प्रयोग गर्नुहुन्छ?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "feReproductiveQ1", value: "Y" },
    options: [
      { label: "Disposable", labelNp: "डिस्पोजेबल प्याड", value: "D" },
      { label: "Reusable", labelNp: "कपडाको प्याड", value: "R" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "feReproductiveQ5",
    label: "How do you dispose sanitary napkin?",
    labelNp: "प्याड कसरी फाल्नुहुन्छ?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "feReproductiveQ1", value: "Y" },
    options: [
      { label: "Burn", labelNp: "जलाउने", value: "B" },
      { label: "Bury", labelNp: "पुर्ने", value: "U" },
      { label: "Garbage", labelNp: "फोहोरमा", value: "T" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "feReproductiveQ6",
    label: "How do you wash it?",
    labelNp: "कसरी धुनुहुन्छ?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "feReproductiveQ1", value: "Y" },
    options: [
      { label: "Water only", labelNp: "पानी मात्र", value: "W" },
      { label: "Soap and water", labelNp: "साबुन पानी", value: "S" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "feReproductiveQ7",
    label: "How do you dry it?",
    labelNp: "कसरी सुकाउनुहुन्छ?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "feReproductiveQ1", value: "Y" },
    options: [
      { label: "Sun", labelNp: "घाममा", value: "S" },
      { label: "Protected", labelNp: "छायाँमा", value: "A" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  // ---------- Family planning ----------
  {
    key: "feReproductiveQ8",
    label: "Using contraceptive method?",
    labelNp: "परिवार नियोजन प्रयोग गर्नुहुन्छ?",
    type: "select",
    required: true,
    options: [
      { label: "Yes", labelNp: "गर्छौं", value: "Y" },
      { label: "No", labelNp: "गर्दैनौं", value: "N" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "feReproductiveQ9",
    label: "Which method?",
    labelNp: "कुन साधन?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "feReproductiveQ8", value: "Y" },
    options: [
      { label: "Pill", labelNp: "पिल्स", value: "P" },
      { label: "Condom", labelNp: "कण्डम", value: "C" },
      { label: "Implant", labelNp: "इम्पलान्ट", value: "M" },
      { label: "IUD", labelNp: "आईयूडी", value: "U" },
      { label: "Injection", labelNp: "सुई", value: "I" },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  // ---------- Symptoms ----------
  {
    key: "feReproductiveQ10",
    label: "Any of the following problems?",
    labelNp: "तलका मध्ये कुनै समस्या छ?",
    type: "checkbox",
    options: [
      { label: "Burning urine", labelNp: "पिसाब पोल्ने", value: "1" },
      { label: "Discharge", labelNp: "पानी बग्ने", value: "2" },
      { label: "Sore", labelNp: "घाउ", value: "3" },
      { label: "Growth", labelNp: "मासु", value: "4" },
      { label: "Pain", labelNp: "दुख्ने", value: "5" },
    ],
  },

  {
    key: "feReproductiveQ11",
    label: "Visited health facility?",
    labelNp: "स्वास्थ्य संस्था जानुभयो?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "feReproductiveQ10", value: "1" },
    options: [
      { label: "Yes", labelNp: "गयौं", value: "Y" },
      { label: "No", labelNp: "गएनौं", value: "N" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "feReproductiveQ12",
    label: "Do you have following complications?",
    labelNp: "तलका मध्ये कुनै समस्या छ?",
    type: "checkbox",
    options: [
      { label: "Fistula", labelNp: "पिसाब चुहिने", value: "1" },
      { label: "Prolapse", labelNp: "आङ खस्ने", value: "2" },
      { label: "Bleeding", labelNp: "धेरै रगत", value: "3" },
      { label: "Breast lump", labelNp: "स्तनमा गिर्खा", value: "4" },
    ],
  },

  {
    key: "feReproductiveQ13",
    label: "Visited provider for above?",
    labelNp: "स्वास्थ्यकर्मी भेट्नुभयो?",
    type: "select",
    required: true,
    visibleIf: { dependsOn: "feReproductiveQ12", value: "1" },
    options: [
      { label: "Yes", labelNp: "गएँ", value: "Y" },
      { label: "No", labelNp: "गएको छैन", value: "N" },
    ],
    validation: [{ type: "required", message: "Required" }],
  },

  {
    key: "feReproductiveQ13Details",
    label: "Details",
    labelNp: "विवरण लेख्नुहोस्",
    type: "text",
    visibleIf: { dependsOn: "feReproductiveQ13", value: "Y" },
    required: true,
    validation: [{ type: "required", message: "Required" }],
  },
];
