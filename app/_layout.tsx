import { useEffect, useState } from "react";
import { AuthProvider } from "@/src/auth/context/AuthProvider";
import AuthGate from "@/src/auth/router/AuthGate";
import { ensureDbReady, isDbReady } from "@/src/db/bootstrap";
import { AppBootstrap } from "@/src/bootstrap/AppBootstrap";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-get-random-values";
import "../global.css";
import { AppLogger } from "@/src/utils/AppLogger";

export default function RootLayout() {
  // const [dbReady, setDbReady] = useState(false);
  const [, forceRender] = useState(0);

  useEffect(() => {
    async function bootstrap() {
      try {
        await AppLogger.initialize();

        await ensureDbReady();

        await AppLogger.log("INFO", "DATABASE_READY");

        forceRender((x) => x + 1);
      } catch (error: any) {
        await AppLogger.log("ERROR", "APP_BOOTSTRAP_FAILED", {
          message: error?.message,
        });
      }
    }

    bootstrap();
  }, []);

  if (!isDbReady) {
    AppLogger.log("WARN", "DATABASE_NOT_READY_RENDER_BLOCKED");
    return null; // splash later
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppBootstrap />
        <AuthGate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
