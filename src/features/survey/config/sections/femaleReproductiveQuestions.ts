import { QuestionConfig } from "../../components/QuestionRenderer";

const SHOW_UNLESS_PREGNANT: NonNullable<QuestionConfig["visibleIf"]> = {
  dependsOn: "feReproductiveQ3",
  operator: "notEquals",
  value: "Y",
};

export const feReproductiveQuestions: QuestionConfig[] = [
  // ---------- MENSTRUATION ----------
  {
    key: "feReproductiveQ1",
    label: "Have you had menstruation in last 45 days/6 weeks?",
    labelNp: "के तपाईंलाई पछिल्लो ४५ दिन वा ६ हप्ताभित्र महिनावारी भएको छ?",
    type: "select",
    options: [
      {
        label: "Yes",
        labelNp: "छ",
        value: "Y",
      },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select if menstruation occurred recently",
      },
    ],
  },

  {
    key: "feReproductiveQ2",
    label: "Have you done pregnancy test?",
    labelNp: "के तपाईंले गर्भ जाँच (Pregnancy Test) गर्नुभयो?",
    type: "select",
    visibleIf: { dependsOn: "feReproductiveQ1", value: "N" },
    options: [
      { label: "Yes", labelNp: "गरें", value: "Y" },
      {
        label: "No → Advice to do pregnancy test",
        labelNp: "गरेको छैन → गर्भ जाँच गर्न सल्लाह दिने",
        value: "N",
      },
    ],
    validation: [
      {
        type: "required",
        message: "Please select if pregnancy test was done",
      },
    ],
  },

  {
    key: "feReproductiveQ3",
    label: "Are you pregnant?",
    labelNp: "के तपाईं गर्भवती हुनुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feReproductiveQ1", value: "N" },
    options: [
      {
        label: "Yes",
        labelNp: "छु",
        value: "Y",
      },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select pregnancy status",
      },
    ],
  },

  // ---------- MENSTRUAL HYGIENE ----------
  {
    key: "feReproductiveQ4",
    label: "What kind of menstrual product you use?",
    labelNp: "महिनावारी हुँदा तपाईं के प्रयोग गर्नुहुन्छ?",
    type: "select",
    visibleIf: SHOW_UNLESS_PREGNANT,
    options: [
      {
        label: "Disposable sanitary napkin",
        labelNp: "एकपटक प्रयोग गरिने प्याड (डिस्पोजेबल)",
        value: "D",
      },
      {
        label: "Reusable sanitary napkin",
        labelNp: "धोएर फेरि प्रयोग गर्न मिल्ने कपडाको प्याड",
        value: "R",
      },
    ],
    validation: [
      {
        type: "required",
        message: "Please select menstrual product used",
      },
    ],
  },

  // Only for Disposable
  {
    key: "feReproductiveQ5",
    label: "How do you dispose sanitary napkin?",
    labelNp: "प्रयोग गरेको प्याडलाई कसरी तह लगाउनुहुन्छ (फाल्नुहुन्छ)?",
    type: "select",
    visibleIf: { dependsOn: "feReproductiveQ4", value: "D" },
    visibleIfAll: [SHOW_UNLESS_PREGNANT],
    options: [
      { label: "Burn it", labelNp: "जलाउने", value: "B" },
      { label: "Bury it", labelNp: "पुर्ने", value: "U" },
      { label: "Throw into garbage", labelNp: "फोहोरमा फाल्ने", value: "T" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select how you dispose sanitary napkin",
      },
    ],
  },

  // Only for Reusable
  {
    key: "feReproductiveQ6",
    label: "How do you wash it?",
    labelNp: "तपाईं यसलाई कसरी धुनुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feReproductiveQ4", value: "R" },
    visibleIfAll: [SHOW_UNLESS_PREGNANT],
    options: [
      { label: "With water only", labelNp: "पानीले मात्र", value: "W" },
      { label: "With soap and water", labelNp: "साबुन र पानीले", value: "S" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select how you wash it",
      },
    ],
  },

  {
    key: "feReproductiveQ7",
    label: "How do you dry it?",
    labelNp: "तपाईं यसलाई कसरी सुकाउनुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feReproductiveQ4", value: "R" },
    visibleIfAll: [SHOW_UNLESS_PREGNANT],
    options: [
      { label: "In the sun", labelNp: "घाममा", value: "S" },
      {
        label: "In protected area away from sunlight",
        labelNp: "घाम नलाग्ने सुरक्षित ठाउँमा",
        value: "A",
      },
    ],
    validation: [
      {
        type: "required",
        message: "Please select how you dry it",
      },
    ],
  },

  // ---------- FAMILY PLANNING ----------
  {
    key: "feReproductiveQ8",
    label: "Are you or your partner using any contraceptive method?",
    labelNp:
      "के तपाईं वा तपाईंको श्रीमानले परिवार नियोजनको साधन प्रयोग गर्नुहुन्छ?",
    type: "select",
    visibleIf: SHOW_UNLESS_PREGNANT,
    options: [
      { label: "Yes", labelNp: "गर्छौं", value: "Y" },
      {
        label: "No",
        labelNp: "गर्दैनौं",
        value: "N",
      },
    ],
    validation: [
      {
        type: "required",
        message: "Please select if contraceptive method is used",
      },
    ],
  },

  {
    key: "feReproductiveQ9",
    label: "What kind of method is it?",
    labelNp: "कुन प्रकारको साधन प्रयोग गर्नुहुन्छ?",
    type: "select",
    visibleIf: { dependsOn: "feReproductiveQ8", value: "Y" },
    visibleIfAll: [SHOW_UNLESS_PREGNANT],

    options: [
      { label: "Pill", labelNp: "पिल्स (चक्की)", value: "P" },
      { label: "Condom", labelNp: "कण्डम", value: "C" },
      { label: "Implant", labelNp: "इम्पलान्ट", value: "M" },
      { label: "IUD", labelNp: "आई.यू.डी.", value: "U" },
      { label: "Injection", labelNp: "सुई (डिपो)", value: "I" },
      { label: "Others", labelNp: "अन्य", value: "O" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select contraceptive method",
      },
    ],
  },

  {
    key: "feReproductiveQ9Others",
    label: "Other method (specify)",
    labelNp: "अन्य (लेख्नुहोस्)",
    type: "text",
    visibleIf: { dependsOn: "feReproductiveQ9", value: "O" },
    visibleIfAll: [
      SHOW_UNLESS_PREGNANT,
      { dependsOn: "feReproductiveQ8", value: "Y" },
    ],
    validation: [
      {
        type: "required",
        message: "Please specify the method",
      },
    ],
  },

  // ---------- SYMPTOMS ----------
  {
    key: "feReproductiveQ10Ans1",
    groupTitle: "Are you/or your partner suffering from any of the following?",
    groupTitleNp: "के तपाईं वा तपाईंको श्रीमानलाई तलका मध्ये कुनै समस्या छ?",
    label: "Burning urine",
    labelNp: "पिसाब पोल्ने",
    type: "radio",
    compactChoices: true,
    required: true,
    visibleIf: SHOW_UNLESS_PREGNANT,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },
  {
    key: "feReproductiveQ10Ans2",
    label: "Genital discharge (curdy/foul smelling/itchy)",
    labelNp: "यौनाङ्गबाट पानी वा पीप बग्ने (गन्हाउने/चिलाउने)",
    type: "radio",
    compactChoices: true,
    required: true,
    visibleIf: SHOW_UNLESS_PREGNANT,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },
  {
    key: "feReproductiveQ10Ans3",
    label: "Genital sore/ulcer",
    labelNp: "यौनाङ्गमा घाउ वा खटिरा",
    type: "radio",
    compactChoices: true,
    required: true,
    visibleIf: SHOW_UNLESS_PREGNANT,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },
  {
    key: "feReproductiveQ10Ans4",
    label: "Abnormal growth in genital area",
    labelNp: "यौनाङ्गमा अस्वाभाविक मासु पलाएको वा डल्लो",
    type: "radio",
    compactChoices: true,
    required: true,
    visibleIf: SHOW_UNLESS_PREGNANT,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },
  {
    key: "feReproductiveQ10Ans5",
    label: "Lower abdominal pain",
    labelNp: "पेटको तल्लो भाग दुख्ने",
    type: "radio",
    compactChoices: true,
    required: true,
    visibleIf: SHOW_UNLESS_PREGNANT,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },

  {
    key: "feReproductiveQ11",
    label: "Have you or your partner visited a health facility?",
    labelNp: "के तपाईं वा तपाईंको श्रीमान स्वास्थ्य संस्थामा जचाउन जानुभयो? ",
    type: "select",
    visibleIfAll: [SHOW_UNLESS_PREGNANT],
    visibleIfAny: [
      { dependsOn: "feReproductiveQ10Ans1", value: "Y" },
      { dependsOn: "feReproductiveQ10Ans2", value: "Y" },
      { dependsOn: "feReproductiveQ10Ans3", value: "Y" },
      { dependsOn: "feReproductiveQ10Ans4", value: "Y" },
      { dependsOn: "feReproductiveQ10Ans5", value: "Y" },
    ],
    options: [
      { label: "Yes", labelNp: "गयौं", value: "Y" },
      { label: "No", labelNp: "गएनौं", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "Please select whether you visited a health facility",
      },
    ],
  },

  {
    key: "feReproductiveQ12Ans1",
    groupTitle: "Q12. Do you have following symptom/ complication?",
    groupTitleNp: "के तपाईंलाई तलका मध्ये कुनै समस्या छ?",
    label: "Leaking of urine or stool (Fistula)",
    labelNp: "पिसाब वा दिसा चुहिएर नरोकिने (फिस्टुला)",
    type: "radio",
    compactChoices: true,
    required: true,
    visibleIf: SHOW_UNLESS_PREGNANT,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },
  {
    key: "feReproductiveQ12Ans2",
    label: "Something coming out from vagina (Prolapse)",
    labelNp: "पाठेघर खस्ने वा आङ खस्ने समस्या (प्रोल्याप्स)",
    type: "radio",
    compactChoices: true,
    required: true,
    visibleIf: SHOW_UNLESS_PREGNANT,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },
  {
    key: "feReproductiveQ12Ans3",
    label: "Excessive vaginal bleeding",
    labelNp: "धेरै रगत बग्ने समस्या",
    type: "radio",
    compactChoices: true,
    required: true,
    visibleIf: SHOW_UNLESS_PREGNANT,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },
  {
    key: "feReproductiveQ12Ans4",
    label: "Breast lump/cancer",
    labelNp: "स्तनमा गिर्खा वा क्यान्सर",
    type: "radio",
    compactChoices: true,
    required: true,
    visibleIf: SHOW_UNLESS_PREGNANT,
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      { type: "required", message: "Please select Yes or No for this symptom" },
    ],
  },

  {
    key: "feReproductiveQ13",
    label: "Have you visited any health provider or facility?",
    labelNp:
      "के तपाईंले स्वास्थ्यकर्मीलाई भेट्नुभयो वा स्वास्थ्य संस्था जानुभयो?",
    type: "select",
    visibleIfAll: [SHOW_UNLESS_PREGNANT],
    visibleIfAny: [
      { dependsOn: "feReproductiveQ12Ans1", value: "Y" },
      { dependsOn: "feReproductiveQ12Ans2", value: "Y" },
      { dependsOn: "feReproductiveQ12Ans3", value: "Y" },
      { dependsOn: "feReproductiveQ12Ans4", value: "Y" },
    ],
    options: [
      { label: "Yes", labelNp: "गएँ", value: "Y" },
      {
        label: "No → Refer to a health facility",
        labelNp: "गएको छैन → स्वास्थ्य संस्थामा जान सल्लाह दिने",
        value: "N",
      },
    ],
    validation: [
      {
        type: "required",
        message: "Please select whether you visited a provider",
      },
    ],
  },

  {
    key: "feReproductiveQ13Details",
    label: "Name of the facility for referral",
    labelNp: "जान सल्लाह दिइएको स्वास्थ्य संस्थाको नाम",
    type: "text",
    visibleIf: { dependsOn: "feReproductiveQ13", value: "N" },
    visibleIfAll: [SHOW_UNLESS_PREGNANT],
    visibleIfAny: [
      { dependsOn: "feReproductiveQ12Ans1", value: "Y" },
      { dependsOn: "feReproductiveQ12Ans2", value: "Y" },
      { dependsOn: "feReproductiveQ12Ans3", value: "Y" },
      { dependsOn: "feReproductiveQ12Ans4", value: "Y" },
    ],
    validation: [
      {
        type: "required",
        message: "Please enter the name of the referral facility",
      },
    ],
  },
];
