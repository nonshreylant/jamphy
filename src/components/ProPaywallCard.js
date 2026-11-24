"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { usePro } from "./ProProvider";

export default function ProPaywallCard({
  title = "Jamphy Pro Feature",
  featureName = "Jamphy Pro",
  description = "Upgrade to Jamphy Pro with a one-time payment of ₹499 to unlock full access.",
  backHref = "/questions",
  backLabel = "Back to Questions",
}) {
  const { status } = useSession();
  const { openUpgradeModal } = usePro();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[32px] p-8 sm:p-10 text-center shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-3">
          Jamphy Pro • ₹499 One-Time
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-8">{description}</p>

        <div className="space-y-3">
          {status === "unauthenticated" ? (
            <button
              onClick={() => signIn("google")}
              className="w-full py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition cursor-pointer"
            >
              Sign in with Google
            </button>
          ) : (
            <button
              onClick={() => openUpgradeModal(featureName)}
              className="w-full py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition cursor-pointer shadow-xl"
            >
              Unlock Pro for ₹499
            </button>
          )}

          <Link
            href={backHref}
            className="block w-full py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition text-sm font-medium"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

