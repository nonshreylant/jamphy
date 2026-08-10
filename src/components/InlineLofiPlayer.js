"use client";
import { motion } from "framer-motion";
import { useLofi } from "./LofiProvider";

export default function InlineLofiPlayer() {
  const { isPlaying, togglePlay, progress, seek } = useLofi();

  return (
    <div className="flex items-center gap-2 w-24 opacity-70 hover:opacity-100 transition-opacity">
      <button 
        onClick={togglePlay} 
        className="focus:outline-none flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/10 transition-colors shrink-0 text-white/90"
      >
        {isPlaying ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="translate-x-[1px]"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        )}
      </button>

      <div 
        className="h-[2px] w-full bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
        onClick={(e) => {
          const bounds = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - bounds.left) / bounds.width;
          seek(percent);
        }}
      >
        <motion.div 
          className="h-full bg-white rounded-full"
          style={{ width: `${progress}%` }}
          layout
          transition={{ type: "tween", ease: "linear", duration: 0.1 }}
        />
      </div>
    </div>
  );
}
