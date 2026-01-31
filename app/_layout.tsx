import { useEffect, useState } from "react";
import { AuthProvider } from "@/src/auth/context/AuthProvider";
import AuthGate from "@/src/auth/router/AuthGate";
import { ensureDbReady, isDbReady } from "@/src/db/bootstrap";

export default function RootLayout() {
  // const [dbReady, setDbReady] = useState(false);
  const [, forceRender] = useState(0);

  useEffect(() => {
    ensureDbReady().then(() => {
      // force one re-render when DB becomes ready
      forceRender((x) => x + 1);
    });
  }, []);

  if (!isDbReady) {
    console.log("Database is not ready");
    return null; // splash later
  }

  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
