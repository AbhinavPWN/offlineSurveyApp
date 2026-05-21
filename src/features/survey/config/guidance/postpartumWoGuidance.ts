import { SectionGuidance } from "./guidanceTypes";

export const postpartumWoGuidance: SectionGuidance = {
  title: "Postpartum Mother and Baby Care Guidance",

  groups: [
    {
      title: "Mother Care (सुत्केरी आमाको हेरचाह)",

      items: [
        {
          en: "Eat nutritious food, drink plenty of fluids, and continue iron–folic acid and calcium supplements.",
          np: "पोषिलो खानेकुरा खानुहोस्, प्रशस्त मात्रामा झोलिलो कुरा पिउनुहोस् र स्वास्थ्यकर्मीले भने अनुसार आइरन, फोलिक एसिड र क्याल्सियम चक्कीहरू नियमित रूपमा सेवन गर्नुहोस्।",
          category: "nutrition",
        },

        {
          en: "Start breastfeeding within 1 hour of birth and continue exclusive breastfeeding for 6 months.",
          np: "बच्चा जन्मिएको १ घण्टाभित्रै स्तनपान गराउन सुरु गर्नुहोस्। ६ महिनासम्म बच्चालाई आमाको दूध मात्र खुवाउनुहोस् र पटक–पटक दूध चुसाउनुहोस्।",
          category: "nutrition",
        },

        {
          en: "Take adequate rest and avoid heavy physical work.",
          np: "पर्याप्त मात्रामा आराम गर्नुहोस् र धेरै गाह्रो वा भारी शारीरिक काम नगर्नुहोस्।",
          category: "general",
        },

        {
          en: "Seek medical care immediately for heavy bleeding, fever, foul-smelling discharge, severe headache, blurred vision, or fits.",
          np: "धेरै रगत बगेमा, ज्वरो आएमा, यौनाङ्गबाट गन्हाउने पानी बगेमा, धेरै टाउको दुखेमा, आँखा धमिलो देखिएमा वा जिउ काँपेमा तुरुन्तै स्वास्थ्य संस्थामा जानुहोस्।",
          category: "danger_sign",
        },

        {
          en: "Keep normal delivery or C-section wounds clean and dry.",
          np: "नर्मल डेलिभरी वा शल्यक्रिया (C-section) गरिएको ठाउँको घाउलाई सधैं सफा र सुख्खा राख्नुहोस्।",
          category: "hygiene",
        },

        {
          en: "Use family planning methods before 6 weeks to prevent unintended pregnancy.",
          np: "अर्को गर्भ रहन नदिन सुत्केरी भएको ६ हप्ता पुग्नुभन्दा पहिले नै परिवार नियोजनका साधन प्रयोग गर्नुहोस्।",
          category: "family_planning",
        },

        {
          en: "Seek help if you feel persistent sadness, anxiety, or emotional distress.",
          np: "यदि धेरै दिनसम्म लगातार दुखी महसुस हुने, धेरै डर लाग्ने वा मन अशान्त हुने समस्या भएमा तुरुन्तै सहयोग लिनुहोस्।",
          category: "mental_health",
        },
      ],
    },

    {
      title: "Baby Care (शिशुको हेरचाह)",

      items: [
        {
          en: "Keep the baby warm with skin-to-skin contact and delay bathing for at least 24 hours.",
          np: "बच्चालाई न्यानो राख्न आफ्नो छातीमा टाँसेर (कङ्गारु केयर) राख्नुहोस्। साथै, बच्चा जन्मिएको कम्तिमा २४ घण्टासम्म ननुहाइदिनुहोस्।",
          category: "general",
        },

        {
          en: "Feed only breast milk. Do not give water, honey, or other foods or liquids.",
          np: "बच्चालाई आमाको दूध मात्र खुवाउनुहोस्। पानी, मह, वा अन्य कुनै पनि थप खानेकुरा वा झोल पदार्थ नखुवाउनुहोस्।",
          category: "nutrition",
        },

        {
          en: "Keep the umbilical cord clean and dry. Do not apply anything on the cord.",
          np: "बच्चाको नाभीलाई सधैं सफा र सुख्खा राख्नुहोस्। नाभीमा तेल, धूलो वा कुनै औषधि नलगाउनुहोस्।",
          category: "hygiene",
        },

        {
          en: "Seek medical care urgently if the baby has poor feeding, fast or difficult breathing, fever, cold body, lethargy, or yellowing within the first 24 hours.",
          np: "यदि बच्चाले दूध राम्ररी नखाएमा, छिटो–छिटो वा गाह्रो गरी सास फेरेमा, ज्वरो आएमा, जिउ धेरै चिसो भएमा, बच्चा सुस्त भएमा, वा जन्मिएको २४ घण्टाभित्र शरीर पहेँलो देखिएमा तुरुन्तै स्वास्थ्य संस्थामा लैजानुहोस्।",
          category: "danger_sign",
        },

        {
          en: "Ensure timely immunization for the baby.",
          np: "आफ्नो बच्चालाई समयमै सबै आवश्यक खोपहरू लगाउनुहोस्।",
          category: "referral",
        },

        {
          en: "Attend scheduled postnatal follow-up visits for both mother and baby.",
          np: "स्वास्थ्यकर्मीले तोकेको समयमा आमा र शिशुको नियमित स्वास्थ्य जाँच (Postnatal Visit) गराउनुहोस्।",
          category: "referral",
        },
      ],
    },
  ],
};
