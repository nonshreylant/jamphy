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
  const [isSharing, setIsSharing] = useState(false);
  const [isCopyingLink, setIsCopyingLink] = useState(false);
  const captureRef = useRef(null);

  const handleCopyLink = async () => {
    if (!captureRef.current) return;
    try {
      setIsCopyingLink(true);
      
      const shareId = crypto.randomUUID();
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      
      const textMessage = `Attempt this question on Jamphy! Practice more IIT JAM Physics questions for free at ${shareUrl}`;
      await navigator.clipboard.writeText(textMessage);
      alert("Link copied! Preview is generating in the background...");

      await new Promise(r => setTimeout(r, 100));
      
      const dataBlob = await htmlToImage.toBlob(captureRef.current, {
        quality: 1,
        backgroundColor: '#09090b',
        pixelRatio: 2,
      });

      const reader = new FileReader();
      reader.readAsDataURL(dataBlob);
      reader.onloadend = async () => {
        try {
          await fetch('/api/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: shareId, imageData: reader.result })
          });
        } catch (err) {
          console.error("Failed to upload share image", err);
        }
      }
    } catch (error) {
      console.error("Failed to copy link", error);
    } finally {
      setIsCopyingLink(false);
    }
  };

  const handleShareQuestion = async () => {
    if (!captureRef.current) return;
    try {
      setIsSharing(true);
      // Brief delay to let the UI update and fonts load in the hidden div
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await htmlToImage.toBlob(captureRef.current, {
        quality: 1,
        backgroundColor: '#09090b', // zinc-950
        pixelRatio: 2, // High res for retina
      });
      
      if (dataUrl) {
        const textMessage = `Attempt this question on Jamphy! Practice more IIT JAM Physics questions for free at https://jamphy.com`;
        
        // Use Web Share API if supported (Works on mobile, Safari, macOS Chrome)
        // This flawlessly passes both the image AND text directly to WhatsApp/other apps.
        if (navigator.canShare) {
          const file = new File([dataUrl], 'jamphy-question.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file], text: textMessage })) {
            try {
              await navigator.share({
                title: 'Jamphy Question',
                text: textMessage,
                files: [file]
              });
              return; // Shared successfully via share sheet
            } catch (err) {
              if (err.name === 'AbortError') return; // User cancelled, do nothing
              console.error("Web Share failed, falling back to clipboard", err);
            }
          }
        }

        // Fallback: Clipboard API
        const textBlob = new Blob([textMessage], { type: 'text/plain' });
        const htmlBlob = new Blob([`<p>${textMessage}</p>`], { type: 'text/html' });
        
        await navigator.clipboard.write([
          new ClipboardItem({ 
            'image/png': dataUrl,
            'text/plain': textBlob,
            'text/html': htmlBlob
          })
        ]);
        alert("Image and link copied to clipboard! You may need to paste twice depending on the app.");
      }
    } catch (error) {
      console.error("Failed to share question", error);
      alert("Failed to share question. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(() => {
    fetch("/api/questions")
      .then(res => res.json())
      .then(data => {
        if (data.questions && data.questions.length > 0) {
          setQuestionsList(prev => {
            const existingKeys = new Set(prev.map(q => `${q.year}-${q.id}`));
            const uniqueDbQuestions = data.questions.filter(
              q => !existingKeys.has(`${q.year}-${q.id}`)
            );
            return [...prev, ...uniqueDbQuestions];
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveGoal = (newTarget) => {
    setIsGoalModalOpen(false);
    setGoalData(prev => ({
      ...prev,
      target: newTarget,
      percentage: prev.completed > 0 ? (prev.completed / newTarget) * 100 : 0
    }));
  };

  const fetchGoalData = () => {
    if (status === "authenticated") {
      fetch("/api/goals/today")
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setGoalData(data);
          }
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchGoalData();
      fetch("/api/friends/list")
        .then(res => res.json())
        .then(data => {
          if (data.friends) {
            setMyFollows(new Set(data.friends.map(f => f.id)));
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
          const data = await res.json();
          setSearchResults(data.users || []);
          setShowSearchDropdown(true);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  const toggleFollow = async (targetUserId) => {
    const isFollowing = myFollows.has(targetUserId);
    try {
      const res = await fetch("/api/friends/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action: isFollowing ? "unfollow" : "follow" })
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

  const [testActive, setTestActive] = useState(false);
  const [liveRoomActive, setLiveRoomActive] = useState(false);

  const [browseMode, setBrowseMode] = useState("subject");
  const [selectedBrowseYear, setSelectedBrowseYear] = useState(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("All");

  const [selectedSubject, setSelectedSubject] =
    useState(null);

  const [selectedYear, setSelectedYear] =
    useState("All");

  const [selectedSubtopic, setSelectedSubtopic] =
    useState("All");

  const [selectedType, setSelectedType] =
    useState("All");




  const [activeQuestion, setActiveQuestion] =
    useState(null);

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [isCorrect, setIsCorrect] =
    useState(null);

  const [natAnswer, setNatAnswer] =
    useState("");

  const [showSolution, setShowSolution] =
    useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [vaultItems, setVaultItems] = useState(new Set());
  const [toastMessage, setToastMessage] = useState("");
  
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  const fetcher = (url) => fetch(url).then(r => r.json());
  const { data: commentsData, mutate: mutateComments } = useSWR(
    activeQuestion ? `/api/comments?questionId=${activeQuestion.year}-${activeQuestion.id}` : null,
    fetcher
  );

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: `${activeQuestion.year}-${activeQuestion.id}`,
          text: newComment
        })
      });
      if (res.ok) {
        setNewComment("");
        mutateComments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) return;
    setIsUpdatingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          text: editingCommentText
        })
      });
      if (res.ok) {
        setEditingCommentId(null);
        setEditingCommentText("");
        mutateComments();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update comment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        mutateComments();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete comment");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/vault")
        .then(res => res.json())
        .then(data => {
          if (data.vaultItems) {
            setVaultItems(new Set(data.vaultItems.map(v => v.questionId)));
          }
        })
        .catch(console.error);
    }
  }, [status]);

  const toggleVault = async () => {
    if (status !== "authenticated") return alert("Please sign in to save to vault.");
    const qid = String(activeQuestion.id);
    const currentlyInVault = vaultItems.has(qid);

    if (currentlyInVault) {
      if (!confirm("Remove this question from the Mistakes Vault?")) return;
      try {
        await fetch(`/api/vault?questionId=${qid}`, { method: "DELETE" });
        setVaultItems(prev => {
          const next = new Set(prev);
          next.delete(qid);
          return next;
        });
        setToastMessage("Removed from Mistakes Vault");
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await fetch("/api/vault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: qid, isCorrect: false })
        });
        setVaultItems(prev => new Set(prev).add(qid));
        setToastMessage("Added to Mistakes Vault");
      } catch (e) {
        console.error(e);
      }
    }
    setTimeout(() => setToastMessage(""), 3000);
  };

  const questionLoadTime = useRef(0);

  const handleReportQuestion = async () => {
    if (!reportDescription.trim()) return;
    setIsReporting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: `${activeQuestion.year}-${activeQuestion.id}`,
          description: reportDescription,
        }),
      });
      if (res.ok) {
        setIsReportModalOpen(false);
        setReportDescription("");
        alert("Report submitted successfully. Thank you!");
      } else {
        alert("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsReporting(false);
    }
  };

  const availableYears = useMemo(() => {
    return [...new Set(questionsList.map((q) => q.year))].sort((a, b) => b - a);
  }, [questionsList]);

  const filteredQuestions = useMemo(() => {

    return questionsList.filter((q) => {

      const subjectMatch = selectedSubject
        ? selectedSubject.subtopics.includes(q.subject)
        : true;

      const browseYearMatch = selectedBrowseYear
        ? q.year === selectedBrowseYear
        : true;

      const yearFilterMatch =
        selectedYear === "All"
          ? true
          : q.year === Number(selectedYear);

      const subtopicMatch =
        selectedSubtopic === "All"
          ? true
          : q.subject === selectedSubtopic;

      const subjectFilterMatch =
        selectedSubjectFilter === "All"
          ? true
          : syllabus.find(s => s.id === selectedSubjectFilter)?.subtopics.includes(q.subject);

      const typeMatch =
        selectedType === "All"
          ? true
          : q.type === selectedType;

      return (
        subjectMatch &&
        browseYearMatch &&
        yearFilterMatch &&
        subtopicMatch &&
        subjectFilterMatch &&
        typeMatch
      );

    });

  }, [
    selectedSubject,
    selectedBrowseYear,
    selectedYear,
    selectedSubtopic,
    selectedSubjectFilter,
    selectedType,
    questionsList,
  ]);

  const currentQuestionIndex =
    activeQuestion
      ? filteredQuestions.findIndex(
        (q) =>
          q.id === activeQuestion.id &&
          q.year === activeQuestion.year
      )
      : -1;

  useEffect(() => {
    questionLoadTime.current = Date.now();
  }, [currentQuestionIndex]);

  const hasPreviousQuestion =
    currentQuestionIndex > 0;

  const hasNextQuestion =
    currentQuestionIndex <
    filteredQuestions.length - 1;

  const resetQuestionState = () => {

    setSelectedAnswer(null);

    setIsCorrect(null);

    setNatAnswer("");

    setShowSolution(false);

    questionLoadTime.current = Date.now();
  };

  const goToQuestion = (index) => {

    if (
      index < 0 ||
      index >= filteredQuestions.length
    ) {

      return;

    }

    setActiveQuestion(
      filteredQuestions[index]
    );

    resetQuestionState();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlQuestionId = params.get('id');
      if (urlQuestionId && questionsList.length > 0 && !activeQuestion) {
        const q = questionsList.find(q => `${q.year}-${q.id}` === urlQuestionId);
        if (q) {
          setActiveQuestion(q);
          resetQuestionState();
          
          const url = new URL(window.location.href);
          url.searchParams.delete('id');
          window.history.replaceState({}, '', url);
        }
      }
    }
  }, [questionsList, activeQuestion]);

  const isNAT =
    activeQuestion?.type === "NAT";

  const isMSQ =
    activeQuestion?.type === "MSQ";

  const getCorrectOptions = (question) => {

    if (question.type === "NAT") {

      return [String(question.correctAnswer)];

    }

    // MSQ
    if (Array.isArray(question.correctAnswers)) {

      return question.correctAnswers;

    }

    // MCQ
    if (
      typeof question.correctAnswer === "number"
    ) {

      return [question.correctAnswer];

    }

    return [];

  };

  const arraysMatch = (first, second) => {

    if (first.length !== second.length) {

      return false;

    }

    const firstSet = new Set(first);

    return second.every((value) =>
      firstSet.has(value)
    );

  };

  const handleSingleAnswer = (index) => {
    if (isCorrect !== null) return;
    setSelectedAnswer(index);
  };

  const submitSingleAnswer = () => {
    if (selectedAnswer === null) return;
    const [correctOptionIndex] = getCorrectOptions(activeQuestion);
    const correct = selectedAnswer === correctOptionIndex;
    setIsCorrect(correct);
    
    const timeTaken = Math.floor((Date.now() - questionLoadTime.current) / 1000);
    
    if (session?.user) {
      const questionId = `${activeQuestion.year}-${activeQuestion.id}`;
      fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, isCorrect: correct })
      }).catch(err => console.error(err));
      
      fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, isCorrect: correct, timeTaken, subject: activeQuestion.subject, selectedAnswer: String(selectedAnswer + 1) })
      }).catch(err => console.error(err));
    }
  };

  const handleMultipleAnswer = (index) => {

    if (isCorrect !== null) {

      return;

    }

    setSelectedAnswer((current) => {

      const currentAnswers = Array.isArray(current)
        ? current
        : [];

      if (currentAnswers.includes(index)) {

        return currentAnswers.filter(
          (answer) => answer !== index
        );

      }

      return [...currentAnswers, index];

    });

  };

  const submitMultipleAnswer = () => {

    const answers = Array.isArray(selectedAnswer)
      ? selectedAnswer
      : [];

    if (answers.length === 0) {

      return;

    }

    const correct = arraysMatch(
      answers,
      getCorrectOptions(activeQuestion)
    );
    setIsCorrect(correct);
    
    const timeTaken = Math.floor((Date.now() - questionLoadTime.current) / 1000);
    
    if (session?.user) {
      const questionId = `${activeQuestion.year}-${activeQuestion.id}`;
      fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, isCorrect: correct })
      }).catch(err => console.error(err));
      
      fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, isCorrect: correct, timeTaken, subject: activeQuestion.subject, selectedAnswer: answers.map(a => a + 1).sort().join(',') })
      }).catch(err => console.error(err));
    }
  };

  const submitNATAnswer = () => {

    const enteredAnswer = Number(
      String(natAnswer).trim()
    );

    if (isNaN(enteredAnswer)) {
      return;
    }
    
    let correct = false;

    if (
      activeQuestion.correctAnswerMin !== undefined &&
      activeQuestion.correctAnswerMax !== undefined
    ) {

      correct = enteredAnswer >= activeQuestion.correctAnswerMin &&
        enteredAnswer <= activeQuestion.correctAnswerMax;

    } else {
      const correctAnswer = Number(
        activeQuestion.correctAnswer
      );
      correct = enteredAnswer === correctAnswer;
    }
    
    setIsCorrect(correct);
    
    const timeTaken = Math.floor((Date.now() - questionLoadTime.current) / 1000);
    
    if (session?.user) {
      const questionId = `${activeQuestion.year}-${activeQuestion.id}`;
      fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, isCorrect: correct })
      }).catch(err => console.error(err));
      
      fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, isCorrect: correct, timeTaken, subject: activeQuestion.subject, selectedAnswer: String(enteredAnswer) })
      })
      .then(() => fetchGoalData())
      .catch(err => console.error(err));
    }
  };

  if (status === "loading" || !mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-10 h-10 border border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

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

      {isReportModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Report Question Error</h3>
            <p className="text-zinc-400 mb-6">
              Found a mistake in the question, options, or answer? Let us know and we&apos;ll fix it.
            </p>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Describe the error..."
              className="w-full h-32 bg-black border border-zinc-700 rounded-2xl p-4 text-white outline-none mb-6 resize-none focus:border-zinc-500 transition"
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-6 py-3 rounded-2xl border border-zinc-700 text-white hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReportQuestion}
                disabled={isReporting || !reportDescription.trim()}
                className="px-6 py-2 bg-red-600/20 text-red-400 font-bold rounded-xl border border-red-500/30 hover:bg-red-600/40 transition disabled:opacity-50"
              >
                {isReporting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isGoalModalOpen && (
        <GoalSettingsModal
          currentTarget={goalData.target}
          onClose={() => setIsGoalModalOpen(false)}
          onSave={handleSaveGoal}
        />
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-white px-6 py-3 rounded-full font-medium shadow-2xl z-[99999] animate-in fade-in slide-in-from-bottom-4">
          {toastMessage}
        </div>
      )}
    </div>
  );
}