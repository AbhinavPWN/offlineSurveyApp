import { useEffect, useState } from "react";
import { AuthProvider } from "@/src/auth/context/AuthProvider";
import AuthGate from "@/src/auth/router/AuthGate";
import { ensureDbReady } from "@/src/db/bootstrap";
import { AppBootstrap } from "@/src/bootstrap/AppBootstrap";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-get-random-values";
import "../global.css";
import { AppLogger } from "@/src/utils/AppLogger";
import { AppErrorBoundary } from "@/src/components/AppErrorBoundary";
import { debugDatabase } from "@/src/debug/debugDatabase";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        await AppLogger.initialize();
        await ensureDbReady();
        await AppLogger.log("INFO", "DATABASE_READY");
        console.log("DATABASE_READY");

        if (__DEV__) {
          await debugDatabase();
        }

        setDbReady(true); // 🔥 THIS is the correct trigger
      } catch (error: any) {
        console.log("APP_BOOTSTRAP_FAILED", error);
        await AppLogger.log("ERROR", "APP_BOOTSTRAP_FAILED", {
          message: error?.message,
        });
      }
    }

    bootstrap();
  }, []);

  if (!dbReady) {
    return null; // later you can show splash screen
  }

  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <AppBootstrap />

          <AuthGate />
        </AuthProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
