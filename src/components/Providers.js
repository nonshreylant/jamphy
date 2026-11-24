"use client";

import { useEffect, useRef } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import ProfileCompletionModal from "./ProfileCompletionModal";
import { LofiProvider } from "./LofiProvider";
import { ProProvider } from "./ProProvider";

const DEV_BYPASS_LOGIN =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEV_BYPASS_LOGIN === "true";

function SessionManager({ children }) {
  const { data: session, status } = useSession();
  const hasAttemptedDevLogin = useRef(false);

  useEffect(() => {
    if (session?.error === "UserBlocked") {
      signOut({ callbackUrl: "/?error=AccessDenied" });
    }
  }, [session]);

  useEffect(() => {
    if (DEV_BYPASS_LOGIN && status === "unauthenticated" && !hasAttemptedDevLogin.current) {
      hasAttemptedDevLogin.current = true;
      signIn("dev-login", { redirect: false });
    }
  }, [status]);

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
