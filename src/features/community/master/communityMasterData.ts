import { DropdownOption } from "../../member-form/models/DropdownOptions";
import {
  CommunityCategoryNo,
  CommunityMemberCategory,
} from "@/src/services/api/dto/CommunityDTO";

type CommunityDropdownOption<T extends string> = Omit<
  DropdownOption,
  "value"
> & {
  value: T;
};

export const communityCategoryNoOptions: CommunityDropdownOption<CommunityCategoryNo>[] =
  [
    { labelEn: "1", labelNp: "१", value: "1" },
    { labelEn: "2", labelNp: "२", value: "2" },
    { labelEn: "3", labelNp: "३", value: "3" },
    { labelEn: "4", labelNp: "४", value: "4" },
    { labelEn: "5", labelNp: "५", value: "5" },
    { labelEn: "6", labelNp: "६", value: "6" },
    { labelEn: "7", labelNp: "७", value: "7" },
    { labelEn: "8", labelNp: "८", value: "8" },
    { labelEn: "9", labelNp: "९", value: "9" },
    { labelEn: "10", labelNp: "१०", value: "10" },
  ];

export const communityMemberCategoryOptions: CommunityDropdownOption<CommunityMemberCategory>[] =
  [
    {
      labelEn: "Reproductive Women",
      labelNp: "प्रजनन उमेरका महिला",
      value: "1",
    },
    {
      labelEn: "Pregnant Women",
      labelNp: "गर्भवती महिला",
      value: "2",
    },
    {
      labelEn: "Adolescent Girls",
      labelNp: "किशोरी",
      value: "3",
    },
    {
      labelEn: "Adolescent Boys",
      labelNp: "किशोर",
      value: "4",
    },
  ];
