"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserMenu from "../../components/UserMenu";
import InvitesMenu from "../../components/InvitesMenu";
import { questions as staticQuestions } from "../../data/questions";
import { syllabus } from "../../data/syllabus";
import TestManager from "../../components/test/TestManager";
import TestModal from "../../components/test/TestModal";
import MathText from "../../components/MathText";
import { useTransitionContext } from "../../components/TransitionProvider";
import GoalSettingsModal from "../../components/GoalSettingsModal";
import InlineLofiPlayer from "../../components/InlineLofiPlayer";
import { motion, AnimatePresence } from "framer-motion";
import QuestionBrowser from "../../components/QuestionBrowser";
import * as htmlToImage from "html-to-image";

const LEAGUE_COLORS = {
  Bronze: "#cd7f32",
  Silver: "#c0c0c0",
  Gold: "#ffd700",
  Platinum: "#e5e4e2",
  Diamond: "#b9f2ff",
};

const icons = {
  math: "∫",
  mechanics: "⚛",
  waves: "〰",
  em: "⚡",
  thermo: "🔥",
  modern: "☄",
  solid: "⌁",
};

export default function IITJamPhysicsHub() {
  const { data: session, status, update } = useSession();
  const { navigateWithTransition } = useTransitionContext();
  const cursorRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [goalData, setGoalData] = useState({ target: 20, completed: 0, percentage: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [myFollows, setMyFollows] = useState(new Set());
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [questionsList, setQuestionsList] = useState(staticQuestions);
  const [testActive, setTestActive] = useState(false);
  const [liveRoomActive, setLiveRoomActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/questions")
      .then(res => res.json())
      .then(data => {
        if (data.questions && data.questions.length > 0) {
          const merged = [...staticQuestions];
          data.questions.forEach(dq => {
            if (!merged.some(q => q.id === dq.id && q.year === dq.year)) {
              merged.push(dq);
            }
          });
          setQuestionsList(merged);
        }
      })
      .catch(console.error);
  }, []);

  const fetchGoalData = () => {
    fetch('/api/goals/today')
      .then(res => res.json())
      .then(data => {
        if (data.target) setGoalData(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchGoalData();
      fetch('/api/friends/list')
        .then(res => res.json())
        .then(data => {
          if (data.following) {
            setMyFollows(new Set(data.following.map(u => u.id)));
          }
        })
        .catch(console.error);
    }
  }, [status]);

  useEffect(() => {
    if (searchQuery.length >= 1) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/users/search?q=${searchQuery}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.users || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const toggleFollow = async (targetUserId) => {
    try {
      const isFollowing = myFollows.has(targetUserId);
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch('/api/friends/follow', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      });
      if (res.ok) {
        setMyFollows(prev => {
          const next = new Set(prev);
          if (isFollowing) next.delete(targetUserId);
          else next.add(targetUserId);
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGoal = (target) => {
    fetch('/api/goals/today', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target })
    }).then(() => {
      fetchGoalData();
      setIsGoalModalOpen(false);
    });
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative z-0">
      <div className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/bgpicdarker.png')" }} />

      <nav className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateWithTransition("/");
              }}
              className="shrink-0"
            >
              <Image
                src="/jamphy2sized.png"
                alt="Logo"
                width={120}
                height={32}
                className="h-auto w-32 object-contain shrink-0"
                priority
              />
            </Link>
          </div>
          <div className="flex gap-4 items-center min-w-0">
            {session?.user && (
              <div className="relative group cursor-pointer flex flex-col items-center shrink-0">
                {/* Desktop Goal Bar */}
                <div className="hidden sm:flex items-center gap-2 py-2">
                  <span className="text-[12px] text-zinc-400 font-light tracking-wide hidden md:inline">Goal</span>
                  <div className="w-36 h-2 rounded-full bg-zinc-800 overflow-hidden relative border border-zinc-700/30">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(goalData.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Mobile Goal Circle */}
                <div className="flex sm:hidden items-center justify-center py-2 shrink-0">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        className="stroke-zinc-800"
                        strokeWidth="2.5"
                        fill="transparent"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        className="stroke-amber-500"
                        strokeWidth="2.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 12}
                        strokeDashoffset={2 * Math.PI * 12 * (1 - Math.min(goalData.percentage, 100) / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[8px] font-black text-amber-400">
                      {Math.round(goalData.percentage)}%
                    </span>
                  </div>
                </div>
                
                {/* Tooltip/Popover below the bar, visible only when group-hovered */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50 transform origin-top">
                  <div className="bg-zinc-900 border border-zinc-800 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl whitespace-nowrap flex flex-col items-center gap-2">
                    <div className="font-medium text-zinc-300">
                      {goalData.completed} out of {goalData.target} questions done ({Math.round(goalData.percentage)}%)
                    </div>
                    <button 
                      onClick={() => setIsGoalModalOpen(true)}
                      className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors uppercase tracking-wider text-[10px]"
                    >
                      Edit Goal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {session?.user && (
              <div className="relative w-32 sm:w-48 z-[60]">
                <input 
                  type="text" 
                  placeholder="Search friends..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchQuery.length >= 1) setShowSearchDropdown(true); }}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border border-white/20 border-t-white rounded-full animate-spin"></div>
                )}
                
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-64 overflow-y-auto text-left right-0">
                    {searchResults.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 border-b border-zinc-800/50 hover:bg-zinc-900 transition">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 relative flex-shrink-0">
                            {user.image ? (
                              <Image src={user.image} alt={user.name} fill className="object-cover" sizes="32px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-indigo-500 to-purple-500">
                                {user.name?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/profile/${user.id}`} className="block font-bold text-xs text-white hover:text-cyan-400 transition truncate w-24">{user.name}</Link>
                            <div className="text-[10px] text-zinc-500" style={{color: LEAGUE_COLORS[user.currentLeague]}}>{user.currentLeague}</div>
                          </div>
                        </div>
                        {!user.isSelf && (
                          <button 
                            onClick={() => toggleFollow(user.id)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border transition ${
                              myFollows.has(user.id) 
                              ? "border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700" 
                              : "border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                            }`}
                          >
                            {myFollows.has(user.id) ? "Following" : "Follow"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {showSearchDropdown && searchQuery.length >= 1 && searchResults.length === 0 && !isSearching && (
                  <div className="absolute top-full mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-center text-xs text-zinc-500 shadow-2xl right-0">
                    No users found
                  </div>
                )}
              </div>
            )}

            {session?.user && <InvitesMenu />}
            <InlineLofiPlayer />
            <UserMenu session={session} />

            {/* Three-line Options Dropdown Menu */}
            {session?.user && (
              <div className="relative shrink-0 group/menu">
                <button 
                  className="w-[38px] h-[38px] rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                >
                  <div className="flex flex-col justify-between w-4 h-3.5 cursor-pointer transition-transform duration-300 group-hover/menu:rotate-90 py-[2px] px-[0.5px]">
                    <span className="w-full h-[1.5px] bg-zinc-300 group-hover/menu:bg-white rounded-full transition-colors"></span>
                    <span className="w-full h-[1.5px] bg-zinc-300 group-hover/menu:bg-white rounded-full transition-colors"></span>
                    <span className="w-full h-[1.5px] bg-zinc-300 group-hover/menu:bg-white rounded-full transition-colors"></span>
                  </div>
                </button>
                
                <div className="absolute right-0 top-full pt-3 w-56 opacity-0 scale-95 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:scale-100 group-hover/menu:pointer-events-auto transition-all duration-200 z-50 transform origin-top-right">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="py-2">
                      <button
                        onClick={() => setTestActive(true)}
                        className="block w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        Create Test
                      </button>
                      <button
                        onClick={() => setLiveRoomActive(true)}
                        className="block w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        Live Room
                      </button>
                      <Link
                        href="/sprint"
                        className="block w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        Sprint Mode
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Overlay */}
      {status !== "loading" && status === "unauthenticated" && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md bg-zinc-950/90 border border-zinc-800 rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col items-center text-center">
            <div className="mb-8 drop-shadow-2xl">
              <Image
                src="/jamphy2sized.png"
                alt="Jamphy Logo"
                width={180}
                height={49}
                className="rounded-2xl object-contain"
              />
            </div>

            <h2 className="text-3xl font-black mb-3 text-white">Login Required</h2>
            <p className="text-zinc-400 mb-8 font-medium text-sm">
              Please log in to access the practice questions and save your progress.
            </p>
            <button
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 transition-all text-white font-bold text-lg group"
            >
              Sign in with
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                alt="Google"
                width={24}
                height={24}
                className="h-6 w-auto object-contain mt-0.5 group-hover:scale-105 transition-transform"
              />
            </button>
          </div>
        </div>
      )}

      {status === "authenticated" && session?.user?.username && (
        <QuestionBrowser questionsList={questionsList} />

      )}



      {testActive && (
        <TestManager
          allQuestions={questionsList}
          onClose={() => setTestActive(false)}
        />
      )}

      {liveRoomActive && (
        <TestModal 
          title="Create Live Room"
          onClose={() => setLiveRoomActive(false)}
          onGenerate={async (config) => {
            try {
              const res = await fetch('/api/room/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
              });
              const data = await res.json();
              if (res.ok) {
                window.location.href = `/room/${data.roomId}`;
              } else {
                alert(data.error || "Failed to create Live Room");
              }
            } catch (err) {
              alert("An error occurred");
            }
          }}
        />
      )}
    </div>
  );
}
