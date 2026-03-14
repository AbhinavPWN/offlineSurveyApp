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

interface Props {
  form: MemberFormState;
}

const Section = ({ title, children }: any) => (
  <View className="mb-6">
    <Text className="text-lg font-bold mb-2">{title}</Text>
    <View className="space-y-1">{children}</View>
  </View>
);

const Row = ({ label, value }: { label: string; value: any }) => (
  <View className="flex-row justify-between">
    <Text className="text-gray-600">{label}</Text>
    <Text className="font-medium">{value || "-"}</Text>
  </View>
);

export const ReviewStep = React.memo(function ReviewStep({ form }: Props) {
  if (__DEV__) console.log("ReviewStep render");

  const [districtLabel, setDistrictLabel] = useState("-");
  // const [issueDistrictLabel, setIssueDistrictLabel] = useState("-");
  const [municipalityLabel, setMunicipalityLabel] = useState("-");

  useEffect(() => {
    let mounted = true;

    async function resolveLabels() {
      try {
        if (!mounted) return;

        if (form.address1DistrictCode || form.idIssueDistrictCode) {
          const districts = await getAllDistricts();
          const districtMap = new Map(districts.map((d) => [d.id, d.name_en]));

          if (form.address1DistrictCode) {
            setDistrictLabel(districtMap.get(form.address1DistrictCode) ?? "-");
          }

          // if (form.idIssueDistrictCode) {
          //   setIssueDistrictLabel(
          //     districtMap.get(form.idIssueDistrictCode) ?? "-",
          //   );
          // }
        }

        if (form.address1DistrictCode && form.address1Line2) {
          const municipalities = await getMunicipalitiesByDistrict(
            form.address1DistrictCode,
          );

          const muniMap = new Map(municipalities.map((m) => [m.id, m.name_en]));

          setMunicipalityLabel(muniMap.get(form.address1Line2) ?? "-");
        }
      } catch (e) {
        console.log("Review label error:", e);
      }
    }

    resolveLabels();

    return () => {
      mounted = false;
    };
  }, [form.address1DistrictCode, form.idIssueDistrictCode, form.address1Line2]);

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

        <Row
          label="DOB (BS)"
          value={form.dob ? convertADToBSISO(form.dob) : "-"}
        />

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
        <Row label="Address" value={form.address} />
        <Row label="VDC/Municipality" value={municipalityLabel} />
        <Row label="Ward" value={form.address1Line3} />
        <Row label="District" value={districtLabel} />
        {/* <Row label="Province" value={form.address1Province} /> */}
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
        <Row label="Total Asset" value={form.totalAsset} />
        <Row label="Total Liabilities" value={form.totalLiabilities} />
        <Row label="Net Worth" value={form.netWorth} />

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
          <Row label="Disability Type" value={form.disabilityIdent || "-"} />
        )}

        <Row label="Disability Status" value={yesNo(form.disabilityStatus)} />

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
