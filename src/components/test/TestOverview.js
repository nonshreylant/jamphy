import { useState, useEffect } from "react";

export default function TestOverview({ config, questionsCount, onStart, onCancel }) {
  const [countdown, setCountdown] = useState(null); // null means not started, otherwise number 3, 2, 1, 0 (Go)

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown === 0) {
      const timer = setTimeout(() => {
        onStart();
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, onStart]);

  if (countdown !== null) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-3xl flex items-center justify-center">
        <div className="text-[150px] md:text-[250px] font-black text-white animate-pulse">
          {countdown > 0 ? countdown : "GO!"}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-2xl flex flex-col items-center text-center my-8 mt-16">
        
        <h2 className="text-3xl font-light tracking-wide mb-2">Test Overview</h2>
        <p className="text-zinc-400 mb-12 font-light tracking-wider text-xs uppercase">Please review your test settings before proceeding.</p>

        <div className="w-full space-y-6 mb-16 text-left">
          <div className="flex justify-between items-end border-b border-zinc-700 pb-2">
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em]">Total Questions</span>
            <span className="text-xl font-light">{questionsCount}</span>
          </div>
          <div className="flex justify-between items-end border-b border-zinc-700 pb-2">
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em]">Duration</span>
            <span className="text-xl font-light">{config.duration} mins</span>
          </div>
          <div className="flex justify-between items-end border-b border-zinc-700 pb-2">
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em]">Question Types</span>
            <span className="text-lg font-light tracking-widest">{config.types.join(", ")}</span>
          </div>
        </div>

        <div className="w-full flex gap-12 justify-center">
          <button 
            onClick={onCancel}
            className="text-lg font-light tracking-widest text-zinc-500 uppercase hover:text-white transition"
          >
            Cancel
          </button>
          <button 
            onClick={() => setCountdown(3)}
            className="text-lg font-light tracking-widest text-white uppercase hover:text-cyan-400 transition flex items-center gap-2 group"
          >
            Proceed
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
