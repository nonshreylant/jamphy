"use client";

import { useState } from "react";

export default function GoalSettingsModal({ currentTarget, onClose, onSave }) {
  const [target, setTarget] = useState(currentTarget);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (target < 1 || target > 100) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/goals/today", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetQuestions: target }),
      });
      if (res.ok) {
        onSave(target);
      }
    } catch (error) {
      console.error("Failed to save goal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white/[0.04] backdrop-blur-[40px] border border-white/10 rounded-[32px] p-6 md:p-8 w-full max-w-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-light tracking-wide text-white mb-4">Daily Goal</h2>
        <p className="text-sm font-light tracking-wide text-zinc-400 mb-6">
          Set your target for the number of questions to attempt today.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <span className="text-zinc-300 font-light tracking-wide">Questions</span>
            <input
              type="number"
              min="1"
              max="100"
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
              className="w-20 bg-white/5 backdrop-blur-md text-white font-light text-center py-2 px-3 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || target < 1 || target > 100}
            className="w-full bg-white/10 backdrop-blur-md text-white font-light tracking-wide py-3 px-4 rounded-xl border border-white/10 hover:bg-white/20 transition-all disabled:opacity-50 uppercase text-sm"
          >
            {isSaving ? "Saving..." : "Save Goal"}
          </button>
        </div>
      </div>
    </div>
  );
}
