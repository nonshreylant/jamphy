"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import UserMenu from "@/components/UserMenu";
import InlineLofiPlayer from "@/components/InlineLofiPlayer";

import EditProfileModal from "@/components/EditProfileModal";
import { useTransitionContext } from "@/components/TransitionProvider";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { navigateWithTransition } = useTransitionContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data: profileData, error, isLoading } = useSWR(
    status === "authenticated" ? "/api/profile/stats" : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-10 h-10 border border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) return null;

  return (
    <div className="min-h-screen bg-transparent text-white pb-24 font-sans">
      <div className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/bgpicdarker.png')" }} />
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateWithTransition("/");
              }}
              className="shrink-0"
            >
              <Image src="/jamphy2sized.png" alt="Logo" width={148} height={40} className="h-auto w-32 object-contain shrink-0" priority />
            </Link>
            <span className="font-light tracking-widest text-sm uppercase text-zinc-500 hidden sm:block">
              Profile
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <InlineLofiPlayer />
            <UserMenu session={session} />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        {/* HERO CARD */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 border-b border-zinc-800 pb-12 break-words">
          
          <div className="relative z-10 w-32 h-32 rounded-full overflow-hidden border border-zinc-700 bg-black/40 backdrop-blur-md flex items-center justify-center text-4xl font-light shrink-0">
            {session.user.image ? (
              <Image src={session.user.image} alt={session.user.name} fill className="object-cover" sizes="96px" />
            ) : (
              session.user.name ? session.user.name[0].toUpperCase() : "U"
            )}
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2 w-full">
            <h1 className="text-4xl font-light tracking-wide truncate w-full max-w-full">{session.user.name}</h1>
            <p className="text-zinc-500 font-light tracking-wider truncate w-full max-w-full">{session.user.email}</p>
            {profileData?.stats && (
              <div className="flex items-center gap-4 text-sm font-bold mt-2">
                <span className="text-zinc-300">
                  <span className="text-white text-lg">{profileData.stats.followersCount}</span> Followers
                </span>
                <span className="text-zinc-300">
                  <span className="text-white text-lg">{profileData.stats.followingCount}</span> Following
                </span>
              </div>
            )}
          </div>
          
          <div className="relative z-10 mt-6 md:mt-0 shrink-0">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="text-sm font-light tracking-widest text-zinc-400 uppercase hover:text-white transition border-b border-transparent hover:border-white pb-1"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {profileData && (
          <>
            {/* STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-start border-b border-zinc-800 pb-4">
                <div className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em] mb-2">Total Questions</div>
                <div className="text-3xl font-light text-white">{profileData.stats.totalQuestions}</div>
              </div>
              <div className="flex flex-col items-start border-b border-zinc-800 pb-4">
                <div className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em] mb-2">Correct</div>
                <div className="text-3xl font-light text-white">{profileData.stats.totalCorrect}</div>
              </div>
              <div className="flex flex-col items-start border-b border-zinc-800 pb-4">
                <div className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em] mb-2">Accuracy</div>
                <div className="text-3xl font-light text-white">{profileData.stats.accuracy}%</div>
              </div>
              <div className="flex flex-col items-start border-b border-zinc-800 pb-4">
                <div className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em] mb-2">Streak</div>
                <div className="text-3xl font-light text-white">{profileData.stats.currentStreak} d</div>
              </div>
            </div>

            {/* TWO COLUMNS: Heatmap + Subjects on Left, Recent Activity on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-12">
                {/* CALENDAR HEATMAP */}
                <div className="border-b border-zinc-800 pb-12">
                  <h3 className="text-xl font-light tracking-wide mb-8">Activity Calendar</h3>
                  <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-fit">
                    {/* Render a simple grid of squares for the last 91 days (13 weeks) */}
                    {Array.from({ length: 91 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (90 - i));
                      const dStr = d.toISOString().split('T')[0];
                      const entry = profileData.heatmap.find(h => h.date === dStr);
                      const count = entry ? entry.count : 0;
                      
                      let bgClass = "bg-zinc-900 border border-zinc-800";
                      if (count > 0 && count <= 5) bgClass = "bg-white/20 border border-white/20";
                      else if (count > 5 && count <= 15) bgClass = "bg-white/50 border border-white/50";
                      else if (count > 15) bgClass = "bg-white border border-white shadow-[0_0_8px_rgba(255,255,255,0.3)]";

                      return (
                        <div 
                          key={i} 
                          title={`${dStr}: ${count} questions`}
                          className={`w-[11px] h-[11px] rounded-[2px] ${bgClass}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1.5 mt-6 text-xs text-zinc-500 font-light tracking-widest uppercase justify-end">
                    <span>Less</span>
                    <div className="w-[11px] h-[11px] rounded-[2px] bg-zinc-900 border border-zinc-800" />
                    <div className="w-[11px] h-[11px] rounded-[2px] bg-white/20 border border-white/20" />
                    <div className="w-[11px] h-[11px] rounded-[2px] bg-white/50 border border-white/50" />
                    <div className="w-[11px] h-[11px] rounded-[2px] bg-white border border-white" />
                    <span>More</span>
                  </div>
                </div>

                {/* SUBJECT BREAKDOWN */}
                <div className="border-b border-zinc-800 pb-12">
                  <h3 className="text-xl font-light tracking-wide mb-8">Subject Accuracy</h3>
                  <div className="space-y-4">
                    {profileData.breakdown.length === 0 ? (
                      <p className="text-zinc-500 italic">No subject data yet.</p>
                    ) : (
                      profileData.breakdown.map((subject, idx) => (
                        <div key={idx} className="mb-4">
                          <div className="flex justify-between text-xs tracking-wider uppercase font-light text-zinc-400 mb-2">
                            <span>{subject.subject || "Mixed"}</span>
                            <span>{subject.accuracy}% ({subject.correct}/{subject.total})</span>
                          </div>
                          <div className="h-[2px] bg-zinc-900 overflow-hidden w-full">
                            <div 
                              className="h-full bg-white transition-all"
                              style={{ width: `${subject.accuracy}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="lg:col-span-1">
                <div className="border-b lg:border-b-0 border-zinc-800 pb-12 h-full">
                  <h3 className="text-xl font-light tracking-wide mb-8">Recent Activity</h3>
                  <div className="space-y-4">
                    {profileData.recentActivity.length === 0 ? (
                      <p className="text-zinc-500 italic">No recent activity.</p>
                    ) : (
                      profileData.recentActivity.map((attempt) => (
                        <div key={attempt.id} className="flex items-start justify-between py-4 border-b border-zinc-800/50 group">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="text-sm font-light text-zinc-200 truncate group-hover:text-white transition">
                              {attempt.subject || "Question Practice"}
                            </div>
                            <div className="text-xs font-light tracking-wider text-zinc-500 mt-1 uppercase">
                              {new Date(attempt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className={`text-xs tracking-widest uppercase font-light ${attempt.isCorrect ? "text-white" : "text-zinc-500"}`}>
                              {attempt.isCorrect ? "Correct" : "Incorrect"}
                            </div>
                            <div className="text-xs font-light tracking-widest text-zinc-600">
                              {attempt.timeTaken}s
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {isEditModalOpen && <EditProfileModal onClose={() => setIsEditModalOpen(false)} />}
    </div>
  );
}
