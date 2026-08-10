"use client";

import Link from "next/link";
import { useTransitionContext } from "../../components/TransitionProvider";

export default function SprintMode() {
  const { navigateWithTransition } = useTransitionContext();

  return (
    <div className="min-h-screen text-white overflow-hidden relative z-0 flex flex-col items-center justify-center font-sans">
      <div className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/bgpicdarker.png')" }} />
      
      <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-12 md:p-20 shadow-2xl flex flex-col items-center text-center max-w-2xl mx-4">
        <h1 className="text-5xl md:text-6xl font-light tracking-wide text-white mb-6">Sprint Mode</h1>
        <p className="text-zinc-300 text-lg font-light tracking-wide mb-10 max-w-md">
          A high-intensity, time-bound practice mode is currently under development. Get ready to push your limits.
        </p>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            navigateWithTransition("/questions");
          }}
          className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition text-white text-sm font-medium tracking-wide uppercase"
        >
          Return to Practice
        </button>
      </div>
    </div>
  );
}
