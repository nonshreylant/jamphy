import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import MathText from "../MathText";
import InlineLofiPlayer from "../InlineLofiPlayer";

export default function TestInterface({ questions, durationMins, onSubmit }) {
  const [timeRemaining, setTimeRemaining] = useState(durationMins * 60);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Format: { [index]: { status: 'answered'|'review'|'visited'|'unvisited', value: any } }
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    questions.forEach((_, i) => {
      initial[i] = { status: 'unvisited', value: null };
    });
    // Mark first question as visited
    initial[0] = { status: 'visited', value: null };
    return initial;
  });

  const [currentValue, setCurrentValue] = useState(null);

  const handleFinalSubmitRef = useRef();

  // Timer logic
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleFinalSubmitRef.current?.();
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Sync currentValue when currentIndex changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentValue(answers[currentIndex]?.value ?? null);
    
    // Mark as visited if unvisited
    if (answers[currentIndex]?.status === 'unvisited') {
      setAnswers(prev => ({
        ...prev,
        [currentIndex]: { ...prev[currentIndex], status: 'visited' }
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const activeQuestion = questions[currentIndex];
  const isNAT = activeQuestion?.type === "NAT";
  const isMSQ = activeQuestion?.type === "MSQ";

  const handleSingleAnswer = (index) => {
    setCurrentValue(index);
  };

  const handleMultipleAnswer = (index) => {
    setCurrentValue(prev => {
      const current = Array.isArray(prev) ? prev : [];
      if (current.includes(index)) {
        return current.filter(ans => ans !== index);
      }
      return [...current, index];
    });
  };

  const handleNATAnswer = (e) => {
    setCurrentValue(e.target.value);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClearResponse = () => {
    setCurrentValue(null);
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: { status: 'visited', value: null }
    }));
  };

  const handleMarkForReview = () => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: { status: 'review', value: currentValue }
    }));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSaveAndNext = () => {
    // If value is null, empty string, or empty array, it means unattempted, keep as visited (or red if it was visited)
    const isEmpty = currentValue === null || currentValue === "" || (Array.isArray(currentValue) && currentValue.length === 0);
    
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: { status: isEmpty ? 'visited' : 'answered', value: currentValue }
    }));
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinalSubmit = () => {
    // Make sure current question state is saved before submitting
    const finalAnswers = { ...answers };
    const isEmpty = currentValue === null || currentValue === "" || (Array.isArray(currentValue) && currentValue.length === 0);
    
    // Only update if it wasn't already explicitly set in this render cycle
    // Actually, to be safe, just use the latest `currentValue`
    finalAnswers[currentIndex] = {
      status: finalAnswers[currentIndex].status === 'review' ? 'review' : (isEmpty ? 'visited' : 'answered'),
      value: currentValue
    };
    
    onSubmit(finalAnswers);
  };
  
  useEffect(() => {
    handleFinalSubmitRef.current = handleFinalSubmit;
  });

  // Stats for legend
  const stats = {
    answered: Object.values(answers).filter(a => a.status === 'answered').length,
    review: Object.values(answers).filter(a => a.status === 'review').length,
    visited: Object.values(answers).filter(a => a.status === 'visited' && (a.value === null || a.value === "" || (Array.isArray(a.value) && a.value.length === 0))).length, // Visited but not answered or reviewed
    unvisited: Object.values(answers).filter(a => a.status === 'unvisited').length,
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-3xl flex flex-col items-center justify-center h-screen text-white">
        <p className="text-zinc-400 font-light">No questions available to display.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition">Go Back</button>
      </div>
    );
  }

  if (!activeQuestion) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-3xl flex flex-col items-center justify-center h-screen text-white">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 font-light tracking-wide">Loading question...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-xl flex flex-col h-screen text-white overflow-hidden font-sans">
      
      {/* Top Bar */}
      <div className="h-16 border-b border-zinc-800 bg-transparent flex items-center justify-between px-6 md:px-12 shrink-0">
        <div className="flex gap-8 items-center">
          <div className="font-light text-2xl tracking-wide text-white">Test Mode</div>
          
          {/* Legend Overview */}
          <div className="hidden md:flex gap-4 text-xs font-bold uppercase">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-500"></div> Attempted ({stats.answered})
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-500"></div> Unattempted ({stats.visited})
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-purple-500"></div> Review ({stats.review})
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-zinc-700"></div> Not Visited ({stats.unvisited})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <InlineLofiPlayer />
          <div className={`text-2xl font-black font-mono ${timeRemaining < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {formatTime(timeRemaining)}
          </div>
          <button 
            onClick={handleFinalSubmit}
            className="text-sm font-light tracking-widest text-zinc-400 uppercase hover:text-white transition border-b border-transparent hover:border-white pb-1"
          >
            Submit Test
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto relative px-6 md:px-24">
          
          <div className="py-8 md:py-16 flex-1 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-6 mb-12">
            <span className="text-xl font-light text-zinc-500">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-sm font-medium tracking-widest text-zinc-600 uppercase">
              {activeQuestion.type}
            </span>
            <span className="text-sm font-medium tracking-widest text-zinc-600 uppercase">
              {activeQuestion.subject}
            </span>
          </div>

          <div className="text-[18px] md:text-[20px] leading-[1.8] text-zinc-100 font-normal mb-8">
            <MathText>{activeQuestion.question}</MathText>
          </div>

          {(activeQuestion.questionImage || activeQuestion.image) && (
            <div className="mb-12">
              <img 
                src={activeQuestion.questionImage || activeQuestion.image} 
                alt="Question" 
                className="max-h-[400px] w-auto rounded-xl border border-zinc-800"
              />
            </div>
          )}

          {/* Options / Input */}
          <div className="mb-32">
            {isNAT ? (
              <div className="max-w-md">
                <input
                  type="number"
                  value={currentValue || ""}
                  onChange={handleNATAnswer}
                  placeholder="Enter your answer"
                  className="w-full bg-transparent border-b border-zinc-700 pb-2 text-white text-3xl font-light outline-none focus:border-white transition placeholder-zinc-700"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeQuestion.options.map((option, index) => {
                  const isSelected = isMSQ 
                    ? Array.isArray(currentValue) && currentValue.includes(index)
                    : currentValue === index;

                  return (
                    <button
                      key={index}
                      onClick={() => isMSQ ? handleMultipleAnswer(index) : handleSingleAnswer(index)}
                      className={`
                        flex gap-4 items-start rounded-2xl border p-4 text-left transition-all
                        ${isSelected ? 'border-white bg-zinc-800/80' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-500'}
                      `}
                    >
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-[15px] font-bold transition-colors ${isSelected ? "text-black bg-white" : "text-white bg-zinc-800"}`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {activeQuestion.optionImages?.[index] && (
                          <img
                            src={activeQuestion.optionImages[index]}
                            alt={`Option ${index + 1}`}
                            className="rounded-xl border border-zinc-700 mb-3 h-auto max-h-32 object-contain"
                          />
                        )}
                        <MathText className={`text-[16px] leading-relaxed break-words font-normal transition-colors ${isSelected ? "text-white" : "text-zinc-300"}`}>
                          {option}
                        </MathText>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          </div>
          {/* Action Buttons Fixed at Bottom of Main Area */}
          <div className="sticky bottom-0 left-0 right-0 py-8 bg-black/80 backdrop-blur-3xl flex flex-wrap gap-8 items-center justify-between mt-auto z-10 px-6 md:px-24">
            <button 
              onClick={handleClearResponse}
              className="text-lg font-light tracking-widest text-zinc-500 uppercase hover:text-white transition"
            >
              Clear
            </button>
            <div className="flex gap-12 items-center">
              <button 
                onClick={handleMarkForReview}
                className="text-lg font-light tracking-widest text-zinc-500 uppercase hover:text-white transition"
              >
                Review Later
              </button>
              <button 
                onClick={handleSaveAndNext}
                className="text-2xl font-light tracking-widest text-white uppercase hover:text-zinc-300 transition flex items-center gap-4 group"
              >
                Save & Next
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 group-hover:translate-x-2 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel Question Tracker */}
        <div className="w-full md:w-80 h-64 md:h-auto bg-black/40 backdrop-blur-xl flex flex-col shrink-0 border-t md:border-t-0 md:border-l border-zinc-800">
          <div className="p-6 md:p-8 font-light tracking-widest text-sm uppercase text-zinc-500 border-b border-zinc-800">
            Palette
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-4 gap-2">
              {questions.map((_, index) => {
                const status = answers[index]?.status;
                const isEmpty = answers[index]?.value === null || answers[index]?.value === "" || (Array.isArray(answers[index]?.value) && answers[index]?.value.length === 0);
                
                let bgColor = "text-zinc-600 hover:text-zinc-400"; // unvisited
                
                if (status === 'answered') bgColor = "text-white";
                else if (status === 'review') bgColor = "text-purple-400";
                else if (status === 'visited') {
                  if (isEmpty) bgColor = "text-red-400";
                  else bgColor = "text-white"; // fallback if something weird happens
                }

                // If currently viewing, add a border
                const isActive = currentIndex === index;

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-12 flex items-center justify-center font-light text-xl transition-all ${bgColor} ${isActive ? 'scale-125 border-b border-current pb-1' : ''}`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
