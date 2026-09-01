"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { syllabus } from "../data/syllabus";
import MathText from "./MathText";
import { useTransitionContext } from "./TransitionProvider";
import { motion, AnimatePresence } from "framer-motion";
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

export default function QuestionBrowser({ questionsList, title }) {
  const { data: session, status, update } = useSession();
  const { navigateWithTransition } = useTransitionContext();
  const cursorRef = useRef(null);
  const [mounted, setMounted] = useState(false);
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
    <div className="w-full relative z-0">
      <div className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/bgpicdarker.png')" }} />

      {title && <div className="max-w-7xl mx-auto px-6 pt-10 pb-4"><h1 className="text-3xl font-bold">{title}</h1></div>}
<AnimatePresence mode="wait">
          {!selectedSubject && !selectedBrowseYear && (

            <motion.section
              key="categories"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="max-w-7xl mx-auto px-6 py-6"
            >

              <div className="flex justify-center mb-6 mt-2">
                <div className="bg-white/[0.02] backdrop-blur-xl p-1.5 rounded-full flex gap-1 inline-flex border border-white/5 shadow-xl">
                  <button 
                    onClick={() => setBrowseMode('subject')}
                    className={`px-6 py-2 rounded-full font-medium text-xs tracking-wide transition-all duration-300 ${browseMode === 'subject' ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Choose by Subject
                  </button>
                  <button 
                    onClick={() => setBrowseMode('year')}
                    className={`px-6 py-2 rounded-full font-medium text-xs tracking-wide transition-all duration-300 ${browseMode === 'year' ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Choose by Year
                  </button>
                </div>
              </div>

              {browseMode === 'subject' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">

                  {syllabus.map((subject) => (

                    <button
                      key={subject.id}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setSelectedBrowseYear(null);
                        setSelectedYear("All");
                        setSelectedSubtopic("All");
                      }}
                      className="rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-2xl p-4 text-left hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col items-start group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg mb-2 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 text-white shadow-lg">
                        {icons[subject.id]}
                      </div>

                      <h3 className="text-base font-bold tracking-wide text-white/90 mb-1 group-hover:text-white transition-colors">
                        {subject.name}
                      </h3>
                      
                      <div className="text-zinc-400 text-xs font-medium flex items-center gap-1.5 group-hover:text-white transition-colors mt-auto pt-2">
                        Explore Questions 
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </div>
                    </button>

                  ))}

                </div>
              ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">

                  {availableYears.map((year) => (

                    <button
                      key={year}
                      onClick={() => {
                        setSelectedBrowseYear(year);
                        setSelectedSubject(null);
                        setSelectedSubjectFilter("All");
                        setSelectedType("All");
                      }}
                      className="rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-2xl p-4 text-left hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col items-start group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-base mb-2 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 text-white shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M12 17v5"/>
                          <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
                        </svg>
                      </div>

                      <h3 className="text-base font-bold tracking-wide text-white/90 mb-1 group-hover:text-white transition-colors">
                        {year} Questions
                      </h3>
                      
                      <div className="text-zinc-400 text-xs font-medium flex items-center gap-1.5 group-hover:text-white transition-colors mt-auto pt-2">
                        Attempt 
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </div>
                    </button>

                  ))}

                </div>
              )}

            </motion.section>

          )}

          {(selectedSubject || selectedBrowseYear) && !activeQuestion && (

            <motion.section
              key="questions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="max-w-7xl mx-auto px-6 py-16"
            >

              <button
                onClick={() => {
                  setSelectedSubject(null);
                  setSelectedBrowseYear(null);
                }}
                className="text-zinc-500 hover:text-white mb-8 transition font-medium flex items-center gap-2"
              >
                <span>←</span> Back to Browse
              </button>

              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-10 text-white">
                {selectedSubject ? selectedSubject.name : `IIT JAM ${selectedBrowseYear}`}
              </h2>

              <div className="flex flex-wrap gap-4 mb-10">

                {selectedSubject && (
                  <select
                    value={selectedYear}
                    onChange={(e) =>
                      setSelectedYear(e.target.value)
                    }
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-white outline-none focus:border-zinc-600 hover:border-zinc-700 transition"
                  >

                    <option value="All">
                      All Years
                    </option>

                    {availableYears.map((year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ))}

                  </select>
                )}

                {selectedSubject && (
                  <select
                    value={selectedSubtopic}
                    onChange={(e) =>
                      setSelectedSubtopic(e.target.value)
                    }
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-white outline-none focus:border-zinc-600 hover:border-zinc-700 transition"
                  >

                    <option value="All">
                      All Subtopics
                    </option>

                    {selectedSubject.subtopics.map(
                      (topic) => (
                        <option
                          key={topic}
                          value={topic}
                        >
                          {topic}
                        </option>
                      )
                    )}

                  </select>
                )}

                {selectedBrowseYear && (
                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-white outline-none focus:border-zinc-600 hover:border-zinc-700 transition"
                  >
                    <option value="All">All Subjects</option>
                    {syllabus.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}

                <select
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value)
                  }
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-white outline-none focus:border-zinc-600 hover:border-zinc-700 transition"
                >
                  <option value="All">All Types</option>
                  <option value="MCQ">MCQ</option>
                  <option value="MSQ">MSQ</option>
                  <option value="NAT">NAT</option>
                </select>

                <button
                  onClick={() => {
                    setSelectedYear("All");
                    setSelectedSubtopic("All");
                    setSelectedSubjectFilter("All");
                    setSelectedType("All");
                  }}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 text-white hover:bg-zinc-800 transition font-bold"
                >
                  Reset Filters
                </button>

              </div>

              <div className="mb-8 text-zinc-400 text-lg">

                Showing{" "}
                <span className="text-white font-bold">
                  {filteredQuestions.length}
                </span>{" "}
                questions

              </div>

              <div className="grid gap-6">

                {filteredQuestions.map((question) => (

                  <button
                    key={`${question.year}-${question.id}`}
                    onClick={() => {
                      setActiveQuestion(question);
                      resetQuestionState();
                    }}
                    className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-left hover:bg-zinc-900 transition"
                  >

                    <div className="flex gap-3 mb-5 flex-wrap">

                      <span className="px-4 py-1 rounded-full bg-zinc-800 text-sm">
                        {question.year}
                      </span>

                      <span className="px-4 py-1 rounded-full bg-zinc-800 text-sm">
                        {question.subject}
                      </span>

                      <span className="px-4 py-1 rounded-full bg-zinc-800 text-sm">
                        {question.type}
                      </span>

                    </div>

                    <MathText className="question-preview text-lg leading-relaxed text-zinc-200 line-clamp-3 overflow-hidden">
                      {question.question}
                    </MathText>

                  </button>

                ))}

              </div>

            </motion.section>

          )}
          {activeQuestion && (

            <motion.section
              key={activeQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="max-w-7xl mx-auto px-4 md:px-6 py-6"
            >

              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setActiveQuestion(null)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  ← Back to Questions
                </button>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyLink}
                    disabled={isCopyingLink}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 text-sm tracking-wide transition-all font-light"
                  >
                    {isCopyingLink ? (
                      <span className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    )}
                    {isCopyingLink ? 'Copying...' : 'Copy Link'}
                  </button>
                  
                  <button
                    onClick={handleShareQuestion}
                    disabled={isSharing}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 text-sm tracking-wide transition-all font-light"
                  >
                    {isSharing ? (
                      <span className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                    )}
                    {isSharing ? 'Sharing...' : 'Share Image'}
                  </button>
                </div>
              </div>

              {/* Hidden Capture Area for Sharing */}
              <div className="fixed top-0 left-0 -z-50 pointer-events-none opacity-0 overflow-hidden">
                <div 
                  ref={captureRef}
                  className="bg-zinc-950 p-10 border border-zinc-800 rounded-3xl flex flex-col w-[800px]"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                >
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-800/50">
                    <img src="/jamphy2sized.png" alt="Jamphy" className="h-8 object-contain" />
                  </div>
                  
                  <div className="flex gap-2 flex-wrap mb-5">
                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs font-semibold text-white">
                      {activeQuestion.year}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs font-semibold text-white">
                      {activeQuestion.subject}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs font-semibold text-white">
                      {activeQuestion.type}
                    </span>
                  </div>

                  <MathText className="text-[20px] leading-[1.8] text-white font-normal">
                    {activeQuestion.question}
                  </MathText>

                  {(activeQuestion.imageUrl || activeQuestion.questionImage || activeQuestion.image) && (
                    <div className="flex mt-6">
                      <img
                        src={activeQuestion.imageUrl || activeQuestion.questionImage || activeQuestion.image}
                        alt="Question diagram"
                        className="max-h-[400px] w-auto rounded-xl border border-zinc-800"
                      />
                    </div>
                  )}
                  
                  {(activeQuestion.type === "MCQ" || activeQuestion.type === "MSQ") && activeQuestion.options && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {activeQuestion.options.map((option, index) => (
                        <div key={index} className="flex gap-4 items-start rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                          <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-[15px] font-bold text-white bg-zinc-800">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="flex-1 min-w-0">
                            {activeQuestion.optionImages?.[index] && (
                              <img
                                src={activeQuestion.optionImages[index]}
                                alt={`Option ${index + 1}`}
                                className="rounded-xl border border-zinc-700 mb-3 h-auto max-w-full object-contain"
                              />
                            )}
                            <MathText className="text-[16px] leading-relaxed text-zinc-300 break-words font-normal">
                              {option}
                            </MathText>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[32px] border border-zinc-800 bg-zinc-950 p-5 md:p-7">

                <div className="flex gap-2 flex-wrap mb-5">

                  <span className="px-4 py-1 rounded-full bg-zinc-800 text-sm">
                    {activeQuestion.year}
                  </span>

                  <span className="px-4 py-1 rounded-full bg-zinc-800 text-sm">
                    {activeQuestion.subject}
                  </span>

                  <span className="px-4 py-1 rounded-full bg-zinc-800 text-sm">
                    {activeQuestion.type}
                  </span>

                </div>

                <MathText className="question-copy text-[18px] md:text-[20px] leading-[1.8] text-zinc-100 font-normal overflow-x-auto">
                  {activeQuestion.question}
                </MathText>

                {(activeQuestion.imageUrl || activeQuestion.questionImage || activeQuestion.image) && (

                  <div className="flex justify-center mt-6">

                    <img
                      src={activeQuestion.imageUrl || activeQuestion.questionImage || activeQuestion.image}
                      alt="Question diagram"
                      className="h-auto max-w-full rounded-2xl border border-zinc-800"
                    />

                  </div>

                )}

                {isNAT ? (

                  <div className="mt-8">

                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

                      <input
                        type="number"
                        value={natAnswer}
                        onChange={(e) =>
                          setNatAnswer(e.target.value)
                        }
                        disabled={isCorrect !== null}
                        placeholder="Enter answer"
                        className="w-full rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-xl text-white outline-none"
                      />

                      <button
                        onClick={submitNATAnswer}
                        disabled={
                          isCorrect !== null ||
                          natAnswer.trim() === ""
                        }
                        className="mt-5 rounded-2xl bg-white px-6 py-4 text-lg font-bold text-black disabled:opacity-40"
                      >
                        Submit Answer
                      </button>

                    </div>

                  </div>

                ) : (

                  <>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-8">

                      {activeQuestion.options.map(
                        (option, index) => {

                          const correct =
                            getCorrectOptions(
                              activeQuestion
                            ).includes(index);

                          const isSelected =
                            Array.isArray(selectedAnswer)
                              ? selectedAnswer.includes(index)
                              : selectedAnswer === index;

                          let style =
                            "border-zinc-700 bg-zinc-900 hover:bg-zinc-800";

                          if (isCorrect !== null) {

                            if (correct) {

                              style =
                                "border-green-500 bg-green-500/20";

                            }

                            if (
                              isSelected &&
                              !correct
                            ) {

                              style =
                                "border-red-500 bg-red-500/20";

                            }
                          }

                          return (

                            <button
                              key={index}
                              disabled={
                                !isMSQ &&
                                isCorrect !== null
                              }
                              onClick={() => {

                                if (isMSQ) {

                                  handleMultipleAnswer(index);

                                } else {

                                  handleSingleAnswer(index);

                                }

                              }}
                              className={`
    w-full
    rounded-3xl
    border
    p-4 md:p-6
    text-left
    transition
    overflow-hidden
    min-h-[120px]
    ${style}
  `}
                            >

                              <div className="flex gap-4 items-start w-full min-w-0 overflow-hidden">

                                <div
                                  className={`
      w-12 h-12 shrink-0
      ${isMSQ ? "rounded-[16px]" : "rounded-full"}
      flex items-center justify-center
      text-xl text-white
      ${isSelected
                                      ? "bg-blue-600"
                                      : "bg-zinc-700"
                                    }
    `}
                                >
                                  {String.fromCharCode(65 + index)}
                                </div>

                                <div className="flex-1 min-w-0 overflow-hidden">

                                  {activeQuestion.optionImages?.[index] && (

                                    <img
                                      src={activeQuestion.optionImages[index]}
                                      alt={`Option ${index + 1}`}
                                      className="rounded-2xl border border-zinc-700 mb-4 h-auto w-full object-contain"
                                    />

                                  )}

                                  <div className="overflow-x-auto overflow-y-hidden max-w-full">

                                    <MathText className="option-copy w-full text-[14px] sm:text-[15px] md:text-[17px] leading-relaxed text-white break-words">
                                      {option}
                                    </MathText>

                                  </div>

                                </div>

                              </div>

                            </button>

                          );
                        }
                      )}

                    </div>

                    {(isMSQ || activeQuestion?.type === "MCQ") && (

                      <button
                        onClick={activeQuestion?.type === "MCQ" ? submitSingleAnswer : submitMultipleAnswer}
                        disabled={
                          isCorrect !== null ||
                          (isMSQ ? (!Array.isArray(selectedAnswer) || selectedAnswer.length === 0) : selectedAnswer === null)
                        }
                        className="mt-6 rounded-2xl bg-white px-6 py-4 text-lg font-bold text-black disabled:opacity-40"
                      >
                        Submit Answer
                      </button>

                    )}

                  </>

                )}

                <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">

                  <div className="flex gap-4">
                    <button
                      onClick={() =>
                        goToQuestion(currentQuestionIndex - 1)
                      }
                      disabled={!hasPreviousQuestion}
                      className="rounded-2xl border border-zinc-700 px-6 py-4 text-lg font-bold text-white hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Previous Question
                    </button>

                    <button
                      onClick={toggleVault}
                      className={`flex items-center justify-center w-16 h-[60px] rounded-2xl border transition-all ${
                        vaultItems.has(String(activeQuestion.id))
                          ? "bg-amber-500/20 border-amber-500 text-amber-500 hover:bg-amber-500/30"
                          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }`}
                      title="Toggle Mistakes Vault"
                    >
                      {vaultItems.has(String(activeQuestion.id)) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      goToQuestion(currentQuestionIndex + 1)
                    }
                    disabled={!hasNextQuestion}
                    className="rounded-2xl bg-white px-6 py-4 text-lg font-bold text-black disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next Question →
                  </button>

                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="text-sm text-zinc-500 hover:text-red-400 transition underline decoration-zinc-700 underline-offset-4"
                  >
                    Report an error with this question
                  </button>
                </div>

                {isCorrect !== null && (

                  <div
                    className={`mt-6 rounded-2xl border p-5 text-lg font-bold ${isCorrect
                      ? "border-green-500 bg-green-500/20 text-green-200"
                      : "border-red-500 bg-red-500/20 text-red-200"
                      }`}
                  >

                    {isCorrect ? (

                      "Correct answer"

                    ) : (

                      <div className="flex flex-wrap items-center gap-2">

                        <span>
                          Correct answer is:
                        </span>

                        <div className="text-white">

                          {isNAT ? (

                            activeQuestion.correctAnswerMin !== undefined ? (

                              <span>
                                {activeQuestion.correctAnswerMin} to{" "}
                                {activeQuestion.correctAnswerMax}
                              </span>

                            ) : (

                              activeQuestion.correctAnswer

                            )

                          ) : (

                            <MathText className="inline-block">
                              {getCorrectOptions(activeQuestion).map(idx => String.fromCharCode(65 + Number(idx))).join(", ")}
                            </MathText>

                          )}

                        </div>

                      </div>

                    )}

                  </div>

                )}

                {(isCorrect === false || isCorrect === true) && (activeQuestion.solution || activeQuestion.detailedSolution) && (
                  <div className="mt-6 flex flex-col items-center">
                    {!showSolution ? (
                      <button
                        onClick={() => setShowSolution(true)}
                        className="px-6 py-3 rounded-2xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition"
                      >
                        Check Detailed Solution
                      </button>
                    ) : (
                      <div className="w-full mt-4 p-6 rounded-2xl border border-zinc-700 bg-zinc-900">
                        <h4 className="text-xl font-bold text-white mb-4">Detailed Solution</h4>
                        <MathText className="text-zinc-300 leading-relaxed text-sm md:text-base break-words">
                          {activeQuestion.solution || activeQuestion.detailedSolution}
                        </MathText>
                      </div>
                    )}
                  </div>
                )}

                {/* Comments Section */}
                <div className="mt-12 border-t border-zinc-800 pt-8">
                  <div className="text-xl font-bold text-white mb-6">
                    Comments {commentsData?.comments ? `(${commentsData.comments.length})` : ""}
                  </div>
                  
                  <div className="space-y-6">
                    {status === "authenticated" ? (
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm overflow-hidden">
                          {session.user.image ? (
                            <Image src={session.user.image} alt="User" width={40} height={40} className="object-cover" />
                          ) : (
                            session.user.name?.[0].toUpperCase() || "U"
                          )}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment or ask a question..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 resize-none h-24"
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={handlePostComment}
                              disabled={isSubmittingComment || !newComment.trim()}
                              className="px-6 py-2 bg-white text-black font-bold rounded-xl disabled:opacity-50 transition"
                            >
                              {isSubmittingComment ? "Posting..." : "Post"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-zinc-400">
                        Please <button onClick={() => signIn()} className="text-cyan-400 font-bold hover:underline">sign in</button> to join the discussion.
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {!commentsData ? (
                        <div className="text-center py-4 text-zinc-500">Loading comments...</div>
                      ) : commentsData.error ? (
                        <div className="text-center py-4 text-red-500">Failed to load comments: {commentsData.error}</div>
                      ) : !commentsData.comments || commentsData.comments.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">No comments yet. Be the first!</div>
                      ) : (
                        commentsData.comments.map(comment => {
                          const isOwner = comment.userId === session?.user?.id;
                          const isWithin5Mins = (new Date() - new Date(comment.createdAt)) / 1000 / 60 <= 5;
                          const isAdmin = session?.user?.email === "jamphy.admin@gmail.com";
                          const canEdit = isOwner && isWithin5Mins;
                          const canDelete = (isOwner && isWithin5Mins) || isAdmin;
                          const isEditing = editingCommentId === comment.id;

                          return (
                            <div key={comment.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex gap-4">
                              <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm overflow-hidden">
                                {comment.user.image ? (
                                  <Image src={comment.user.image} alt={comment.user.name} width={40} height={40} className="object-cover" />
                                ) : (
                                  comment.user.name?.[0].toUpperCase() || "U"
                                )}
                              </div>
                              {isEditing ? (
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-white">{comment.user.name || "Anonymous"}</span>
                                    <span className="text-xs text-zinc-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <textarea
                                    value={editingCommentText}
                                    onChange={e => setEditingCommentText(e.target.value)}
                                    className="w-full bg-black border border-zinc-750 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 text-sm mt-1"
                                    rows={3}
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => handleUpdateComment(comment.id)}
                                      disabled={isUpdatingComment || !editingCommentText.trim()}
                                      className="px-3 py-1.5 text-xs font-bold text-black bg-white rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => { setEditingCommentId(null); setEditingCommentText(""); }}
                                      className="px-3 py-1.5 text-xs font-bold text-zinc-400 bg-zinc-800 rounded-lg hover:bg-zinc-750 transition"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-white">{comment.user.name || "Anonymous"}</span>
                                      {comment.user.username && (
                                        <span className="text-xs text-zinc-500">@{comment.user.username}</span>
                                      )}
                                      <span className="text-xs text-zinc-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      {canEdit && (
                                        <button
                                          onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.text); }}
                                          className="text-xs text-zinc-500 hover:text-cyan-400 transition"
                                        >
                                          Edit
                                        </button>
                                      )}
                                      {canDelete && (
                                        <button
                                          onClick={() => handleDeleteComment(comment.id)}
                                          className="text-xs text-zinc-500 hover:text-red-400 transition"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed mt-1">{comment.text}</p>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </motion.section>

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
        </AnimatePresence>

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