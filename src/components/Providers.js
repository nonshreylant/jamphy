"use client";

import { useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import ProfileCompletionModal from "./ProfileCompletionModal";
import { LofiProvider } from "./LofiProvider";
import { ProProvider } from "./ProProvider";

function SessionManager({ children }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "UserBlocked") {
      signOut({ callbackUrl: "/?error=AccessDenied" });
    }
  }, [session]);

  return children;
}

export function Providers({ children }) {
  return (
    <SessionProvider>
      <SessionManager>
        <ProProvider>
          <LofiProvider>
            {children}
            <ProfileCompletionModal />
          </LofiProvider>
        </ProProvider>
      </SessionManager>
    </SessionProvider>
  );
}
