import { Stack } from "expo-router";
import SurveyScreen from "@/src/features/survey/screens/SurveyScreen";

export default function SurveyRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Survey" }} />
      <SurveyScreen />
    </>
  );
}
