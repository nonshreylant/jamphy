"use client";

import { SessionProvider } from "next-auth/react";
import ProfileCompletionModal from "./ProfileCompletionModal";
import { LofiProvider } from "./LofiProvider";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <LofiProvider>
        {children}
        <ProfileCompletionModal />
      </LofiProvider>
    </SessionProvider>
  );
}
