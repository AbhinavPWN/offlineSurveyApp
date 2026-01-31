import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { householdRepository } from "@/src/repositories";
import type { Household } from "@/src/repositories/HouseholdRepository";
// import { AppButton } from "@/src/components/AppButton";

export default function HouseholdsScreen() {
  const [loading, setLoading] = useState(true);
  // const [households, setHouseholds] = useState<Household[]>([]);
  const [drafts, setDrafts] = useState<Household[]>([]);
  const [submitted, setSubmitted] = useState<Household[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        try {
          setLoading(true);
          const d = await householdRepository.listDraftHouseholds();
          const s = await householdRepository.listSubmittedHouseholds();
          // setHouseholds(data);
          if (active) {
            setDrafts(d);
            setSubmitted(s);
          }
        } catch (error) {
          console.error("Failed to load households", error);
        } finally {
          if (active) setLoading(false);
        }
      }

      load();

      return () => {
        active = false;
      };
    }, []),
  );
  useEffect(() => {}, []);

  if (loading) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{}}>Loading surveys...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Start Survey */}
      <Pressable
        onPress={() => router.push("/(app)/households/join")}
        style={{
          backgroundColor: "#2563eb",
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
          Start Survey for Client
        </Text>
      </Pressable>

      {/* Drafts */}
      {drafts.length > 0 && (
        <>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            📄 Ongoing Surveys
          </Text>

          {drafts.map((h) => (
            <View
              key={h.id}
              style={{
                padding: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                backgroundColor: "white",
              }}
            >
              <Text style={{ fontWeight: "600" }}>
                Client Code: {h.householdCode}
              </Text>
              <Text style={{ color: "#6b7280", marginBottom: 8 }}>
                Last updated: {new Date(h.updatedAt).toLocaleString()}
              </Text>

              <Pressable
                onPress={() => router.push(`/(app)/households/${h.id}`)}
                style={{
                  backgroundColor: "#16a34a",
                  paddingVertical: 10,
                  borderRadius: 6,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Continue Survey
                </Text>
              </Pressable>
            </View>
          ))}
        </>
      )}

      {/* Submitted */}
      {submitted.length > 0 && (
        <>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            📦 Submitted Surveys
          </Text>

          {submitted.map((h) => (
            <View
              key={h.id}
              style={{
                padding: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                backgroundColor: "#f9fafb",
                opacity: 0.7,
              }}
            >
              <Text style={{ fontWeight: "600" }}>
                Client Code: {h.householdCode}
              </Text>
              <Text style={{ color: "#6b7280" }}>
                Submitted on:{" "}
                {h.submittedAt ? new Date(h.submittedAt).toLocaleString() : "-"}
              </Text>
            </View>
          ))}
        </>
      )}

      {/* Empty State */}
      {drafts.length === 0 && submitted.length === 0 && (
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>No surveys yet</Text>
          <Text style={{ color: "#6b7280", textAlign: "center" }}>
            Start a survey for a client to begin data collection.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
