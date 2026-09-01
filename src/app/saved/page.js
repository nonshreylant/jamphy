"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserMenu from "../../components/UserMenu";
import QuestionBrowser from "../../components/QuestionBrowser";
import Link from "next/link";

export default function SavedQuestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(true);
      fetch("/api/vault")
        .then((res) => res.json())
        .then((data) => {
          if (data.vaultItems) {
            import("../../data/questions").then((module) => {
              const allQuestions = [...module.questions, ...(data.questions || [])];
              const loaded = data.vaultItems.map(item => {
                return allQuestions.find(q => {
                  const qStrId = String(q.id);
                  const qYearId = `${q.year}-${q.id}`;
                  return String(item.questionId) === qStrId || String(item.questionId) === qYearId;
                });
              }).filter(Boolean);
              setSavedQuestions(loaded);
              setIsLoading(false);
            });
          } else {
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error loading saved questions", err);
          setIsLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen text-white overflow-x-hidden relative z-0">
        <div className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/bgpicdarker.png')" }} />
        <nav className="border-b border-white/10 bg-black/40 backdrop-blur-3xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-cyan-400">JAM</span>PHY<span className="text-white/20">.</span>
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex justify-center items-center py-32">
          <div className="w-10 h-10 border border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative z-0 bg-black">
      <div className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/bgpicdarker.png')" }} />
      
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/questions"
            className="text-xl font-black tracking-tight text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-cyan-400">JAM</span>PHY<span className="text-white/20">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </nav>

      {savedQuestions.length === 0 ? (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Saved Questions</h1>
          <p className="text-zinc-400">You haven&apos;t saved any questions to your Vault yet.</p>
        </div>
      ) : (
        <QuestionBrowser questionsList={savedQuestions} title="Saved Questions" />
      )}
    </div>
  );
}
