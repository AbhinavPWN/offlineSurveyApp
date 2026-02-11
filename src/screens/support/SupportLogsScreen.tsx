import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";

import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { Directory, File, Paths } from "expo-file-system";

import { AppLogger } from "../../utils/AppLogger";

export default function SupportLogsScreen() {
  const [logs, setLogs] = useState<string>("");

  /**
   * Load logs
   */
  const loadLogs = async () => {
    const data = await AppLogger.read();
    setLogs(data || "No logs available.");
  };

  useEffect(() => {
    loadLogs();
  }, []);

  /**
   * Copy logs to clipboard
   */
  const copyLogs = async () => {
    if (!logs) {
      Alert.alert("No logs", "Nothing to copy");
      return;
    }

    await Clipboard.setStringAsync(logs);
    Alert.alert("Copied", "Logs copied to clipboard");
  };

  /**
   * Share logs via temp file (NEW API)
   */
  const shareLogs = async () => {
    try {
      if (!logs) {
        Alert.alert("No logs", "Nothing to share");
        return;
      }

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Unavailable", "Sharing not available on this device");
        return;
      }

      // cache/logs/
      const cacheDir = new Directory(Paths.cache, "logs");
      const dirInfo = await cacheDir.info();
      if (!dirInfo.exists) {
        await cacheDir.create({ intermediates: true });
      }

      // cache/logs/app-logs.txt
      const file = new File(cacheDir, `app-logs-${Date.now()}.txt`);

      await file.write(logs);

      await Sharing.shareAsync(file.uri, {
        mimeType: "text/plain",
        dialogTitle: "Share App Logs",
      });
    } catch {
      Alert.alert("Error", "Unable to share logs");
    }
  };

  /**
   * Clear logs
   */
  const clearLogs = async () => {
    Alert.alert("Clear Logs", "Are you sure? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await AppLogger.clear();
          setLogs("");
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white p-3">
      <Text className="text-lg font-bold mb-2">App Logs</Text>

      <ScrollView className="flex-1 bg-black rounded-md p-2">
        <Text selectable className="text-green-400 text-xs font-mono">
          {logs}
        </Text>
      </ScrollView>

      <View className="flex-row flex-wrap gap-2 mt-3">
        <Pressable
          onPress={loadLogs}
          className="px-4 py-2 rounded-md bg-gray-200"
        >
          <Text>Refresh</Text>
        </Pressable>

        <Pressable
          onPress={copyLogs}
          className="px-4 py-2 rounded-md bg-gray-200"
        >
          <Text>Copy</Text>
        </Pressable>

        <Pressable
          onPress={shareLogs}
          className="px-4 py-2 rounded-md bg-gray-200"
        >
          <Text>Share</Text>
        </Pressable>

        <Pressable
          onPress={clearLogs}
          className="px-4 py-2 rounded-md bg-red-600"
        >
          <Text className="text-white">Clear</Text>
        </Pressable>
      </View>
    </View>
  );
}
