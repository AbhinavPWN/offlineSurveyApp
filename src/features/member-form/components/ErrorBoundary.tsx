import React from "react";
import { View, Text, Pressable } from "react-native";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (__DEV__) {
      console.log("MemberForm ErrorBoundary caught error:", error);
    }
  }

  private reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center px-6 bg-white">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            The form encountered an unexpected issue. You can retry safely.
          </Text>
          <Pressable
            onPress={this.reset}
            className="bg-blue-600 px-5 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
