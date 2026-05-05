import { QuestionConfig } from "../../components/QuestionRenderer";

export const neonateQuestions: QuestionConfig[] = [
  {
    key: "neonateQ1",
    label: "Current status of child",
    labelNp: "बच्चाको अहिलेको अवस्था कस्तो छ?",
    type: "select",
    options: [
      { label: "Alive", labelNp: "जीवित", value: "A" },
      { label: "Dead", labelNp: "मृत्यु भएको", value: "D" },
    ],
    validation: [
      {
        type: "required",
        message: "This field is required",
      },
    ],
  },

  {
    key: "neonateQ2",
    label: "In the last 24 hours, is the baby breastfed only?",
    labelNp: "गएको २४ घण्टामा बच्चालाई आमाको दूध मात्र खुवाइएको छ?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "This field is required",
      },
    ],
  },

  {
    key: "neonateQ3",
    label: "Was the newborn vaccinated within 24 hours (BCG)?",
    labelNp: "के बच्चा जन्मेको २४ घण्टाभित्र खोप (BCG) लगाइयो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "लगाइयो", value: "Y" },
      { label: "No", labelNp: "लगाइएन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "This field is required",
      },
    ],
  },

  {
    key: "neonateQ4",
    label: "Was there any danger sign observed since birth?",
    labelNp: "जन्मेदेखि अहिलेसम्म बच्चामा केही खतराका संकेतहरू देखियो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "देखियो", value: "Y" },
      { label: "No", labelNp: "देखिएन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "This field is required",
      },
    ],
  },

  // MULTI SELECT
  {
    key: "neonateQ5",
    label: "What were the danger signs?",
    labelNp: "के-कस्ता खतराका संकेतहरू देखिए?",
    type: "checkbox",
    visibleIf: {
      dependsOn: "neonateQ4", // only if complication = YES
      value: "Y",
    },
    options: [
      {
        label: "Not feeding properly",
        labelNp: "दूध नचुस्ने वा राम्ररी खान नसक्ने",
        value: "1",
      },
      {
        label: "Fast or difficult breathing",
        labelNp: "छिटो-छिटो वा गाह्रो गरी सास फेर्ने",
        value: "2",
      },
      {
        label: "Fever or unusually cold",
        labelNp: "ज्वरो आएको वा जिउ चिसो भएको",
        value: "3",
      },
      {
        label: "Yellow eyes or skin",
        labelNp: "आँखा वा छाला पहेँलो भएको",
        value: "4",
      },
      {
        label: "Very weak/unconscious/fits",
        labelNp: "धेरै कमजोर, बेहोस वा जिउ अठ्याउने",
        value: "5",
      },
    ],
    validation: [
      {
        type: "required",
        message: "Select at least one danger sign",
      },
    ],
  },

  {
    key: "neonateQ6",
    label: "Was the baby taken to health facility?",
    labelNp: "के बच्चालाई स्वास्थ्य संस्था लगियो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "छ", value: "Y" },
      { label: "No", labelNp: "छैन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "This field is required",
      },
    ],
  },

  {
    key: "neonateQ7",
    label: "Where did you deliver?",
    labelNp: "तपाईं कहाँ सुत्केरी हुनुभयो?",
    type: "select",
    options: [
      {
        label: "Facility",
        labelNp: "स्वास्थ्य संस्था - अस्पताल",
        value: "F",
      },
      { label: "Home", labelNp: " घर", value: "H" },
    ],
    validation: [
      {
        type: "required",
        message: "This field is required",
      },
    ],
  },

  {
    key: "neonateQ8",
    label: "Any complications during or after delivery?",
    labelNp: "सुत्केरी हुँदा वा पछि समस्या भयो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "भयो", value: "Y" },
      { label: "No", labelNp: "भएन", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "This field is required",
      },
    ],
  },

  {
    key: "neonateQ9",
    label: "Type of complication",
    labelNp: "कस्तो जटिलता भएको थियो?",
    type: "select", //  dropdown
    visibleIf: {
      dependsOn: "neonateQ8", // only if complication = YES
      value: "Y",
    },
    options: [
      {
        label: "Excessive bleeding",
        labelNp: "धेरै रगत बगेको",
        value: "1",
      },
      {
        label: "Convulsion",
        labelNp: "जिउ अठ्याउने वा काँप्ने",
        value: "2",
      },
      {
        label: "Prolonged labor",
        labelNp: "लामो समयसम्म बेथा लागेको",
        value: "3",
      },
      {
        label: "Retained placenta",
        labelNp: "साल नझरेको",
        value: "4",
      },
      {
        label: "Hand/cord prolapse",
        labelNp: "बच्चाको हात वा सालनाल बाहिर निस्किएको",
        value: "5",
      },
      {
        label: "Others",
        labelNp: "अन्य",
        value: "6",
      },
    ],
    validation: [
      {
        type: "required",
        message: "This field is required",
      },
    ],
  },

  {
    key: "neonateQ9Others",
    label: "Other complication (specify)",
    labelNp: "अन्य (लेख्नुहोस्)",
    type: "text",
    placeholder: "Enter details",
    visibleIf: {
      dependsOn: "neonateQ9",
      value: "6",
    },
    validation: [
      {
        type: "required",
        message: "Please specify other complication",
      },
    ],
  },

  {
    key: "neonateQ10",
    label: "Visited health provider?",
    labelNp: "स्वास्थ्यकर्मीलाई भेट्नुभयो?",
    type: "select",
    options: [
      { label: "Yes", labelNp: "गएँ/भेटेँ", value: "Y" },
      { label: "No", labelNp: "गइनँ/भेटिनँ", value: "N" },
    ],
    validation: [
      {
        type: "required",
        message: "This field is required",
      },
    ],
  },
];
