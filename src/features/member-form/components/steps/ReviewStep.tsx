import React from "react";
import { View, Text } from "react-native";
import { MemberFormState } from "../../models/MemberFormState";
import { convertADToBSISO } from "@/src/utils/nepaliDateUtils";

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

export function ReviewStep({ form }: Props) {
  return (
    <View className="space-y-4">
      {/* BASIC */}
      <Section title="Basic Info">
        <Row
          label="Enroll Date (BS)"
          value={form.enrollDate ? convertADToBSISO(form.enrollDate) : "-"}
        />
        <Row label="Full Name" value={form.fName} />
        <Row label="Gender" value={form.gender} />
        <Row label="Mobile" value={form.mobileNo} />
        <Row label="Marital Status" value={form.maritalStatus} />
        <Row label="Relation to HH" value={form.relationtoHH} />
      </Section>

      {/* IDENTITY */}
      <Section title="Identity">
        <Row label="Document Type" value={form.idDocumentType} />
        <Row label="Document No" value={form.idDocumentNo} />
        <Row label="Issue District" value={form.idIssueDistrictCode} />
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
      </Section>

      {/* ADDRESS */}
      <Section title="Address">
        <Row label="Address Type" value={form.address1Type} />
        <Row label="Address" value={form.address} />
        <Row label="VDC/Municipality" value={form.address1Line2} />
        <Row label="Ward" value={form.address1Line3} />
        <Row label="District" value={form.address1DistrictCode} />
        <Row label="Province" value={form.address1Province} />
      </Section>

      {/* OCCUPATION */}
      <Section title="Occupation & Social">
        <Row label="Caste" value={form.casteCode} />
        <Row label="Religion" value={form.religionCode} />
        <Row label="Occupation" value={form.occupationCode} />
        <Row label="Education" value={form.educationCode} />
      </Section>

      {/* FINANCIAL */}
      <Section title="Financial">
        <Row label="Total Asset" value={form.totalAsset} />
        <Row label="Total Liabilities" value={form.totalLiabilities} />
        <Row label="Net Worth" value={form.netWorth} />
      </Section>

      {/* HEALTH */}
      <Section title="Health">
        <Row
          label="Health Condition?"
          value={form.healthConditionsYn ? "Yes" : "No"}
        />
        {form.healthConditionsYn && (
          <Row label="Condition" value={form.healthConditions} />
        )}

        <Row
          label="Disability Identified?"
          value={form.disabilityIdentYn ? "Yes" : "No"}
        />
        {form.disabilityIdentYn && (
          <Row label="Disability Type" value={form.disabilityIdent} />
        )}

        <Row label="Disability Status" value={form.disabilityStatus} />

        {form.disabilityStatus === "Y" && (
          <>
            <Row label="Seeing" value={form.seeing} />
            <Row label="Hearing" value={form.hearing} />
            <Row label="Walking" value={form.walking} />
            <Row label="Remembering" value={form.remembering} />
            <Row label="Self Care" value={form.selfCare} />
            <Row label="Communicating" value={form.communicating} />
          </>
        )}

        {form.gender === "F" && (
          <>
            <Row label="Pregnancy Status" value={form.pregnancyStatus} />
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
          </>
        )}

        {form.minorYn && (
          <Row label="Vaccination Status" value={form.vaccinationStatus} />
        )}

        <Row label="Health Insurance" value={form.healthInsCoverage} />
      </Section>
    </View>
  );
}
