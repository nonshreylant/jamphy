"use client";

import { useMemo, useState, useEffect } from "react";
import MathText from "../MathText";

export default function TestResult({ questions, answers, onClose }) {
  const [filter, setFilter] = useState("all");
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const getCorrectOptions = (question) => {
    if (question.type === "NAT") return [String(question.correctAnswer)];
    if (Array.isArray(question.correctAnswers)) return question.correctAnswers;
    if (typeof question.correctAnswer === "number") return [question.correctAnswer];
    return [];
  };

  const arraysMatch = (first, second) => {
    if (!first || !second) return false;
    if (first.length !== second.length) return false;
    const firstSet = new Set(first);
    return second.every(val => firstSet.has(val));
  };

  const processedQuestions = useMemo(() => {
    return questions.map((q, i) => {
      const userAns = answers[i]?.value;
      const status = answers[i]?.status;
      const correctOpts = getCorrectOptions(q);
      
      let isCorrect = false;
      let isAttempted = false;

      const isEmpty = userAns === null || userAns === "" || (Array.isArray(userAns) && userAns.length === 0);
      
      if (!isEmpty && status !== 'unvisited') {
        isAttempted = true;
        if (q.type === "NAT") {
          const entered = Number(String(userAns).trim());
          if (!isNaN(entered)) {
            if (q.correctAnswerMin !== undefined && q.correctAnswerMax !== undefined) {
              if (entered >= q.correctAnswerMin && entered <= q.correctAnswerMax) isCorrect = true;
            } else {
              if (entered === Number(q.correctAnswer)) isCorrect = true;
            }
          }
        } else if (q.type === "MSQ") {
          if (arraysMatch(Array.isArray(userAns) ? userAns : [], correctOpts)) isCorrect = true;
        } else {
          if (userAns === correctOpts[0]) isCorrect = true;
        }
      }

      let qStatus = "unattempted";
      if (isAttempted) {
        qStatus = isCorrect ? "correct" : "wrong";
      }

      return {
        ...q,
        originalIndex: i,
        userAns,
        correctOpts,
        isCorrect,
        isAttempted,
        qStatus
      };
    });
  }, [questions, answers]);

  const results = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    processedQuestions.forEach(pq => {
      if (pq.qStatus === "correct") correct++;
      else if (pq.qStatus === "wrong") wrong++;
      else unattempted++;
    });

    return { correct, wrong, unattempted, total: questions.length };
  }, [processedQuestions]);

  const filteredQuestions = useMemo(() => {
    if (filter === "all") return processedQuestions;
    return processedQuestions.filter(pq => pq.qStatus === filter);
  }, [processedQuestions, filter]);

  useEffect(() => {
    const updateVault = async () => {
      for (let i = 0; i < processedQuestions.length; i++) {
        const pq = processedQuestions[i];
        if (!pq.isAttempted) continue;
        
        await fetch('/api/vault', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId: `${pq.year}-${pq.id}`, isCorrect: pq.isCorrect })
        }).catch(err => console.error(err));
        
        const selectedAnsStr = Array.isArray(pq.userAns) 
          ? pq.userAns.map(a => a + 1).sort().join(',') 
          : (pq.type === 'MCQ' ? String(Number(pq.userAns) + 1) : String(pq.userAns));
        
        await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            questionId: `${pq.year}-${pq.id}`, 
            isCorrect: pq.isCorrect, 
            timeTaken: 0, 
            subject: pq.subject, 
            selectedAnswer: selectedAnsStr 
          })
        }).catch(err => console.error(err));
      }
    };
    updateVault();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = results.correct;

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-xl flex flex-col items-center p-6 overflow-y-auto font-sans text-white">
      
      <div className="w-full max-w-4xl mt-12 flex flex-col items-center">
        <h1 className="text-6xl font-light tracking-wide mb-4">Test Submitted</h1>
        <p className="text-zinc-400 mb-16 font-light tracking-wide text-lg">Here is your performance summary</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full mb-16">
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl font-light text-white mb-2">{results.total}</div>
            <div className="text-zinc-500 font-medium uppercase tracking-[0.2em]">Total</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl font-light text-green-400 mb-2">{results.correct}</div>
            <div className="text-green-500/70 font-medium uppercase tracking-[0.2em]">Correct</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl font-light text-red-400 mb-2">{results.wrong}</div>
            <div className="text-red-500/70 font-medium uppercase tracking-[0.2em]">Wrong</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl font-light text-zinc-500 mb-2">{results.unattempted}</div>
            <div className="text-zinc-600 font-medium uppercase tracking-[0.2em]">Unattempted</div>
          </div>
        </div>

        {/* Filters */}
        <div className="w-full mb-12 flex gap-8 justify-center overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "all", label: "All Questions" },
            { id: "correct", label: "Correct" },
            { id: "wrong", label: "Incorrect" },
            { id: "unattempted", label: "Unattempted" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setExpandedQuestionId(null); }}
              className={`text-xl font-light tracking-wide whitespace-nowrap transition pb-1 ${
                filter === f.id 
                  ? "text-white border-b border-white" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Detailed Review (Accordion List) */}
        <div className="w-full mb-12 space-y-3 text-left">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">No questions found for this filter.</div>
          ) : (
            filteredQuestions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              
              let badgeStyle = "bg-zinc-800 text-zinc-400";
              let badgeLabel = "Unattempted";
              
              if (q.qStatus === "correct") {
                badgeStyle = "bg-green-500/20 text-green-400";
                badgeLabel = "Correct";
              } else if (q.qStatus === "wrong") {
                badgeStyle = "bg-red-500/20 text-red-400";
                badgeLabel = "Wrong";
              }

              return (
                <div key={q.id} className="border-b border-zinc-800 transition-all duration-300">
                  {/* Header (Always Visible) */}
                  <button 
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="w-full py-6 flex items-center justify-between gap-4 hover:pl-4 transition-all text-left group"
                  >
                    <div className="flex items-center gap-6 min-w-0">
                      <span className="text-xl font-light text-zinc-500 group-hover:text-white transition">
                        {String(q.originalIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="text-zinc-300 font-light truncate max-w-xs md:max-w-xl text-lg group-hover:text-white transition">
                        {q.question.replace(/\\\[.*?\\\]|\\\(.*?\\\)/g, '...').slice(0, 80).trim()}...
                      </span>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <span className={`text-sm font-medium tracking-widest uppercase ${badgeStyle}`}>
                        {badgeLabel}
                      </span>
                      <svg className={`w-6 h-6 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="py-8 pl-12 pr-4 bg-transparent">
                      <div className="flex gap-4 mb-8">
                        <span className="text-zinc-500 text-sm font-medium tracking-widest uppercase">{q.type}</span>
                        <span className="text-zinc-700 text-sm">|</span>
                        <span className="text-zinc-500 text-sm font-medium tracking-widest uppercase">{q.subject}</span>
                      </div>
                      
                      <MathText className="text-xl text-white mb-12 leading-relaxed font-light">{q.question}</MathText>
                      
                      <div className="grid gap-6 mb-12">
                        {q.type === "NAT" ? (
                          <div className="flex gap-16">
                            <div>
                              <div className="text-zinc-500 text-sm font-medium uppercase tracking-[0.2em] mb-2">Your Answer</div>
                              <div className={`text-3xl font-light ${!q.isAttempted ? 'text-zinc-500' : q.isCorrect ? 'text-green-400' : 'text-red-400'}`}>{q.isAttempted ? q.userAns : "-"}</div>
                            </div>
                            <div>
                              <div className="text-zinc-500 text-sm font-medium uppercase tracking-[0.2em] mb-2">Correct Answer</div>
                              <div className="text-3xl font-light text-white">{q.correctAnswerMin !== undefined ? `${q.correctAnswerMin} - ${q.correctAnswerMax}` : q.correctAnswer}</div>
                            </div>
                          </div>
                        ) : (
                          q.options.map((opt, optIndex) => {
                            const isUserSelected = q.type === "MSQ" ? (Array.isArray(q.userAns) && q.userAns.includes(optIndex)) : q.userAns === optIndex;
                            const isOptionCorrect = q.correctOpts.includes(optIndex);
                            
                            let style = "text-zinc-500";
                            let icon = null;
                            
                            if (isOptionCorrect) {
                              style = "text-green-400";
                              icon = <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
                            } else if (isUserSelected && !isOptionCorrect) {
                              style = "text-red-400";
                              icon = <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
                            }
                            
                            return (
                              <div key={optIndex} className={`flex gap-6 items-start ${style}`}>
                                <div className="text-xl font-light w-6">
                                  {String.fromCharCode(65 + optIndex)}.
                                </div>
                                <div className="flex-1">
                                  <MathText className={`text-xl font-light ${isOptionCorrect ? 'text-white' : (isUserSelected ? 'text-white' : 'text-zinc-400')}`}>{opt}</MathText>
                                </div>
                                {icon && <div className="shrink-0">{icon}</div>}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {q.detailedSolution && (
                        <div className="pt-12 mt-12 border-t border-zinc-800">
                          <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                            Detailed Solution
                          </h4>
                          <MathText className="text-zinc-300 leading-relaxed font-light text-lg">
                            {q.detailedSolution}
                          </MathText>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button 
          onClick={onClose}
          className="mt-16 text-3xl font-light tracking-widest text-zinc-500 uppercase hover:text-white transition group flex items-center gap-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 group-hover:-translate-x-2 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
          </svg>
          Return to Practice
        </button>
      </div>
    </div>
  );
}
