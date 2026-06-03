import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { convertADToBSISO } from "@/src/utils/nepaliDateUtils";
import {
  getAllDistricts,
  getMunicipalitiesByDistrict,
} from "@/src/repositories/addressRepository";
import {
  yesNo,
  genderLabel,
  maritalStatusLabel,
  // documentTypeLabel,
  addressTypeLabel,
} from "@/src/utils/memberLabelMapper";
import { getOptionLabel } from "@/src/utils/optionLabelResolver";
import { casteOptions } from "../../master/casteMasterData";
import {
  educationOptions,
  occupationOptions,
  religionOptions,
} from "../../master/occupationMasterData";
import { relationToHHOptions } from "../../master/memberMasterData";
import { HouseholdLocal } from "@/src/models/household.model";
import { DisabilityType } from "../../master/health.enum";

interface Props {
  form: MemberFormState;
  household: HouseholdLocal;
}

const Section = ({ title, children }: any) => (
  <View className="mb-6">
    <Text className="text-lg font-bold mb-2">{title}</Text>
    <View className="space-y-1">{children}</View>
  </View>
);

const Row = ({ label, value }: { label: string; value: any }) => {
  const displayValue =
    value === null || value === undefined || value === "" ? "-" : value;

  return (
    <View className="flex-row justify-between">
      <Text className="text-gray-600">{label}</Text>
      <Text className="font-medium">{displayValue}</Text>
    </View>
  );
};

const disabilityTypeLabel = (value: string | null | undefined) => {
  const labels: Record<string, string> = {
    [DisabilityType.VISION]: "Vision",
    [DisabilityType.HEARING]: "Hearing",
    [DisabilityType.MOBILITY]: "Mobility",
    [DisabilityType.COGNITION]: "Cognition",
    [DisabilityType.SELF_CARE]: "Self Care",
    [DisabilityType.COMMUNICATION]: "Communication",
    [DisabilityType.AFFECT]: "Affect",
    [DisabilityType.UPPER_BODY]: "Upper Body",
    [DisabilityType.PAIN]: "Pain",
    [DisabilityType.FATIGUE]: "Fatigue",
  };

  if (!value) return "-";

  return labels[value] ?? value;
};

export const ReviewStep = React.memo(function ReviewStep({
  form,
  household,
}: Props) {
  if (__DEV__) console.log("ReviewStep render");

  const [districtLabel, setDistrictLabel] = useState("-");
  // const [issueDistrictLabel, setIssueDistrictLabel] = useState("-");
  const [municipalityLabel, setMunicipalityLabel] = useState("-");

  const calculatedNetWorth =
    Number(form.totalAsset || 0) - Number(form.totalLiabilities || 0);

  useEffect(() => {
    let mounted = true;

    async function resolveLabels() {
      try {
        if (!mounted) return;

        //  DISTRICT FROM HOUSEHOLD
        if (household.districtCode) {
          const districts = await getAllDistricts();
          const districtMap = new Map(districts.map((d) => [d.id, d.name_en]));

          setDistrictLabel(districtMap.get(household.districtCode) ?? "-");
        }

        //  MUNICIPALITY FROM HOUSEHOLD
        if (household.districtCode && household.vdcnpCode) {
          const municipalities = await getMunicipalitiesByDistrict(
            household.districtCode,
          );

          const muniMap = new Map(municipalities.map((m) => [m.id, m.name_en]));

          setMunicipalityLabel(muniMap.get(household.vdcnpCode) ?? "-");
        }
      } catch (e) {
        console.log("Review label error:", e);
      }
    }

    resolveLabels();

    return () => {
      mounted = false;
    };
  }, [household]);

  return (
    <View className="space-y-4">
      {/* BASIC */}
      <Section title="Basic Info">
        <Row
          label="Enroll Date (BS)"
          value={form.enrollDate ? convertADToBSISO(form.enrollDate) : "-"}
        />
        <Row label="Full Name" value={form.fName} />
        <Row label="Gender" value={genderLabel(form.gender)} />
        <Row label="Mobile" value={form.mobileNo} />

        {/* <Row
          label="DOB (BS)"
          value={form.dob ? convertADToBSISO(form.dob) : "-"}
        /> */}
        <Row label="Client Age" value={form.clientAge} />

        <Row
          label="Marital Status"
          value={maritalStatusLabel(form.maritalStatus)}
        />
        <Row
          label="Relation to HH"
          value={getOptionLabel(relationToHHOptions, form.relationtoHH)}
        />
      </Section>

      {/* IDENTITY */}
      {/* <Section title="Identity">
        <Row
          label="Document Type"
          value={documentTypeLabel(form.idDocumentType)}
        />
        <Row label="Document No" value={form.idDocumentNo} />
        <Row label="Issue District" value={issueDistrictLabel} />
        <Row
          label="Issue Date (BS)"
          value={
            form.memIdIssueDate ? convertADToBSISO(form.memIdIssueDate) : "-"
          }
        />
        <Row
          label="DOB (BS)"
          value={form.dob ? convertADToBSISO(form.dob) : "-"}
        />
      </Section> */}

      {/* ADDRESS */}
      <Section title="Address">
        <Row label="Address Type" value={addressTypeLabel(form.address1Type)} />

        {/* ALWAYS FROM HOUSEHOLD */}
        <Row label="Address" value={household.address} />
        <Row label="VDC/Municipality" value={municipalityLabel} />
        <Row label="Ward" value={household.wardNo} />
        <Row label="District" value={districtLabel} />
      </Section>

      {/* OCCUPATION */}
      <Section title="Occupation & Social">
        <Row
          label="Caste"
          value={getOptionLabel(casteOptions, form.casteCode)}
        />
        <Row
          label="Religion"
          value={getOptionLabel(religionOptions, form.religionCode)}
        />
        <Row
          label="Occupation"
          value={getOptionLabel(occupationOptions, form.occupationCode)}
        />
        <Row
          label="Education"
          value={getOptionLabel(educationOptions, form.educationCode)}
        />
      </Section>

      {/* FINANCIAL */}
      <Section title="Financial">
        <Row label="Monthly Income (मासिक आय)" value={form.totalAsset} />
        <Row
          label="Monthly Expenses (मासिक खर्च)"
          value={form.totalLiabilities}
        />
        <Row label="Monthly Saving (मासिक बचत)" value={calculatedNetWorth} />
        {/* <Row label="Net Worth" value={form.netWorth} /> */}

        {(() => {
          const selectedSOI = [
            { label: "Salary", value: form.soiSalary },
            { label: "Business", value: form.soiBusIncome },
            { label: "Investment Return", value: form.soiReturnfrmInvest },
            { label: "Inheritance", value: form.soiInheritance },
            { label: "Remittance", value: form.soiRemittance },
            { label: "Agriculture", value: form.soiAgriculture },
            { label: "Others", value: form.soiOthers },
          ]
            .filter((item) => item.value === true)
            .map((item) => item.label)
            .join(", ");

          return <Row label="Source of Income" value={selectedSOI || "-"} />;
        })()}
      </Section>

      {/* HEALTH */}
      <Section title="Health">
        {(() => {
          const conditions = [
            { label: "Diabetes", value: form.healthConditionsDia },
            { label: "Hypertension", value: form.healthConditionsHyp },
            {
              label: "Cardiovascular Disease",
              value: form.healthConditionsCar,
            },
            { label: "Chronic Lung Disease", value: form.healthConditionsChr },
            { label: "Other", value: form.healthConditionsOth },
          ]
            .filter((item) => item.value === true)
            .map((item) => item.label);

          return (
            <Row
              label="Health Conditions"
              value={conditions.length ? conditions.join(", ") : "-"}
            />
          );
        })()}

        {form.healthConditionsOth && (
          <Row
            label="Other Condition"
            value={form.healthConditionsOthers || "-"}
          />
        )}

        <Row
          label="Disability Identified?"
          value={form.disabilityIdentYn ? "Yes" : "No"}
        />

        {form.disabilityIdentYn && (
          <Row
            label="Disability Type"
            value={disabilityTypeLabel(form.disabilityIdent)}
          />
        )}

        {/* <Row label="Disability Status" value={yesNo(form.disabilityStatus)} /> */}

        {form.disabilityStatus === "Y" && (
          <>
            <Row label="Seeing Difficulty" value={yesNo(form.seeing)} />
            <Row label="Hearing Difficulty" value={yesNo(form.hearing)} />
            <Row label="Walking Difficulty" value={yesNo(form.walking)} />
            <Row
              label="Remembering Difficulty"
              value={yesNo(form.remembering)}
            />
            <Row label="Self Care Difficulty" value={yesNo(form.selfCare)} />
            <Row
              label="Communicating Difficulty"
              value={yesNo(form.communicating)}
            />
          </>
        )}

        {form.gender === "F" && (
          <>
            <Row label="Pregnancy Status" value={yesNo(form.pregnancyStatus)} />

            {form.pregnancyStatus === "Y" && (
              <Row
                label="Pregnancy Date (BS)"
                value={
                  form.pregnancyDate
                    ? convertADToBSISO(form.pregnancyDate)
                    : "-"
                }
              />
            )}

            <Row
              label="Mother of Child"
              value={form.motherofChild ? "Yes" : "No"}
            />

            {form.motherofChild && (
              <Row
                label="Child DOB"
                value={form.childDob ? convertADToBSISO(form.childDob) : "-"}
              />
            )}
          </>
        )}

        {form.minorYn && (
          <Row
            label="Vaccination Status"
            value={yesNo(form.vaccinationStatus)}
          />
        )}

        <Row label="Health Insurance" value={yesNo(form.healthInsCoverage)} />
      </Section>
    </View>
  );
});
