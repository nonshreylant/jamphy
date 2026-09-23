"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import UserMenu from "../components/UserMenu";
import InvitesMenu from "../components/InvitesMenu";
import ActivityRing from "@/components/ActivityRing";
import GoalSettingsModal from "@/components/GoalSettingsModal";
import InlineLofiPlayer from "../components/InlineLofiPlayer";
import { useTransitionContext } from "../components/TransitionProvider";
import { motion, AnimatePresence } from "framer-motion";

let hasLoadedSplash = false;

export default function IITJamPrepPlatform() {
  const { data: session, status } = useSession();
  const { navigateWithTransition } = useTransitionContext();
  const cursorRef = useRef(null);
  const [showSplash, setShowSplash] = useState(!hasLoadedSplash);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).toLowerCase());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!hasLoadedSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        hasLoadedSplash = true;
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;

    let currentX = -100;
    let currentY = -100;

    const moveCursor = (e) => {

      mouseX = e.clientX;
      mouseY = e.clientY;

    };

    window.addEventListener("mousemove", moveCursor);

    let animationFrameId;

    const animate = () => {

      currentX += (mouseX - currentX) * 0.35;
      currentY += (mouseY - currentY) * 0.35;

      if (cursorRef.current) {

        cursorRef.current.style.transform =
          `translate3d(${currentX}px, ${currentY}px, 0)`;

      }

      animationFrameId = requestAnimationFrame(animate);

    };

    animate();

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      cancelAnimationFrame(animationFrameId);
    };

  }, []);

  return (
    <>
      <div 
        className="relative w-full h-screen overflow-hidden flex flex-col bg-zinc-950 font-sans"
        style={{
          backgroundImage: "url('/jamphybg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* SMOOTH CURSOR */}
        <div
          ref={cursorRef}
          className="fixed top-0 left-0 w-6 h-6 rounded-full border border-white pointer-events-none z-[9999] mix-blend-difference -translate-x-1/2 -translate-y-1/2"
        />

        {/* Minimalist Top Navbar */}
        <nav className="absolute top-0 w-full px-8 py-6 flex items-center justify-between z-50 text-xs font-medium tracking-wide text-white/90">
          <div className="flex-1 flex items-center gap-4">
            <span className="opacity-80">{currentTime || "..."}</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center gap-2">
            <InlineLofiPlayer />
          </div>

          <div className="flex-1 flex justify-end gap-6 items-center">
            {session?.user && <InvitesMenu />}
            <UserMenu session={session} />
          </div>
        </nav>

        {/* HUGE Centered Logo (Replacing the Hindi Text) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] z-10 flex flex-col items-center justify-center w-full px-4"
        >
          <Image
            src="/jamphybetter.png"
            alt="Jamphy Logo"
            width={700}
            height={200}
            className="object-contain drop-shadow-2xl opacity-90"
            priority
          />
        </motion.div>

        {/* Apple-style Blurry Glass Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center px-10 py-4 rounded-[2rem] bg-white/[0.04] backdrop-blur-[40px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all hover:bg-white/[0.08]"
        >
          <Link
            href="/questions"
            onClick={(e) => {
              e.preventDefault();
              if (status === "unauthenticated") {
                signIn("google", { callbackUrl: "/questions" });
              } else {
                navigateWithTransition("/questions");
              }
            }}
            className="flex items-center gap-2 text-white/90 text-sm font-medium tracking-wide"
          >
            Explore Questions
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
        </motion.div>
      </div>
    </>
  );
}