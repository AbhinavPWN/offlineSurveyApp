import { Pressable, Text } from "react-native";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
}: AppButtonProps) {
  const backgroundColor = variant === "primary" ? "#2563eb" : "#e5e7eb";
  const textColor = variant === "primary" ? "white" : "#111827";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? "#1e40af" : backgroundColor,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: "center",
      })}
    >
      <Text style={{ color: textColor, fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );
}
