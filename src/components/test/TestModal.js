import { useState, useMemo } from "react";
import { syllabus } from "../../data/syllabus";

export default function TestModal({ onClose, onGenerate, title = "Create Test" }) {
  const [syllabusMode, setSyllabusMode] = useState("full");
  
  // Flatten all sub-subtopics into a master map for fast lookup
  const { allSubSubtopicList, subjectMap, subtopicMap } = useMemo(() => {
    const list = [];
    const subjMap = {}; // subjectId -> all subSubtopics
    const subMap = {};  // subtopicName -> all subSubtopics

    syllabus.forEach(subject => {
      subjMap[subject.id] = [];
      if (subject.subSubtopics) {
        Object.entries(subject.subSubtopics).forEach(([subtopic, subSubs]) => {
          subMap[subtopic] = subSubs;
          subjMap[subject.id].push(...subSubs);
          list.push(...subSubs);
        });
      }
    });

    return { allSubSubtopicList: list, subjectMap: subjMap, subtopicMap: subMap };
  }, []);

  // Track selection by set of sub-subtopics
  const [selectedSubSubtopics, setSelectedSubSubtopics] = useState(() => new Set());
  
  // Accordion state
  const [expandedSubjects, setExpandedSubjects] = useState(() => new Set());
  const [expandedSubtopics, setExpandedSubtopics] = useState(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const [numQuestions, setNumQuestions] = useState(30);
  const [types, setTypes] = useState(["MCQ", "MSQ", "NAT"]);
  const [duration, setDuration] = useState(5);
  const [yearMode, setYearMode] = useState("All");
  const [customYearStart, setCustomYearStart] = useState(2018);
  const [customYearEnd, setCustomYearEnd] = useState(2026);

  // Toggle helpers
  const toggleSubject = (subjectId) => {
    const items = subjectMap[subjectId] || [];
    const isAllSelected = items.length > 0 && items.every(s => selectedSubSubtopics.has(s));
    
    setSelectedSubSubtopics(prev => {
      const next = new Set(prev);
      if (isAllSelected) {
        items.forEach(s => next.delete(s));
      } else {
        items.forEach(s => next.add(s));
      }
      return next;
    });
  };

  const toggleSubtopic = (subtopicName) => {
    const items = subtopicMap[subtopicName] || [];
    const isAllSelected = items.length > 0 && items.every(s => selectedSubSubtopics.has(s));

    setSelectedSubSubtopics(prev => {
      const next = new Set(prev);
      if (isAllSelected) {
        items.forEach(s => next.delete(s));
      } else {
        items.forEach(s => next.add(s));
      }
      return next;
    });
  };

  const toggleSubSubtopic = (subSubName) => {
    setSelectedSubSubtopics(prev => {
      const next = new Set(prev);
      if (next.has(subSubName)) {
        next.delete(subSubName);
      } else {
        next.add(subSubName);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedSubSubtopics(new Set(allSubSubtopicList));
  };

  const clearAll = () => {
    setSelectedSubSubtopics(new Set());
  };

  const toggleExpandSubject = (subjectId) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return next;
    });
  };

  const toggleExpandSubtopic = (subtopicName) => {
    setExpandedSubtopics(prev => {
      const next = new Set(prev);
      if (next.has(subtopicName)) next.delete(subtopicName);
      else next.add(subtopicName);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSubjects(new Set(syllabus.map(s => s.id)));
    const allSubs = [];
    syllabus.forEach(s => s.subtopics.forEach(st => allSubs.push(st)));
    setExpandedSubtopics(new Set(allSubs));
  };

  const collapseAll = () => {
    setExpandedSubjects(new Set());
    setExpandedSubtopics(new Set());
  };

  const handleTypeToggle = (type) => {
    if (types.includes(type)) {
      setTypes(types.filter(t => t !== type));
    } else {
      setTypes([...types, type]);
    }
  };

  const handleGenerate = () => {
    // Derive selected chapters and subtopics for complete compatibility
    const activeSubtopics = [];
    const activeChapters = [];
    
    syllabus.forEach(subject => {
      let subjectHasSelected = false;
      if (subject.subSubtopics) {
        Object.entries(subject.subSubtopics).forEach(([subtopic, subSubs]) => {
          if (subSubs.some(s => selectedSubSubtopics.has(s))) {
            activeSubtopics.push(subtopic);
            subjectHasSelected = true;
          }
        });
      }
      if (subjectHasSelected) {
        activeChapters.push(subject.id);
      }
    });

    onGenerate({
      syllabusMode,
      selectedChapters: activeChapters,
      selectedSubtopics: activeSubtopics,
      selectedSubSubtopics: Array.from(selectedSubSubtopics),
      numQuestions,
      types,
      duration,
      yearMode,
      customYearStart,
      customYearEnd,
    });
  };

  // Filtered view when user searches
  const qLower = searchQuery.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans text-zinc-100">
      <div className="w-full max-w-4xl flex flex-col my-8 mt-16 bg-zinc-950/90 border border-zinc-800/80 rounded-[32px] p-6 sm:p-10 shadow-2xl">
        
        <div className="flex items-start justify-between mb-8 pb-4 border-b border-zinc-800/60">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
            <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-white">{title}</h2>
            <p className="text-zinc-400 font-light tracking-wider text-xs uppercase">
              {title === "Create Test" ? "Generate a customized practice exam" : "Compete with others in real-time"}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition p-1 rounded-full hover:bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-8">
          {/* Syllabus Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400 tracking-[0.2em] uppercase">Syllabus Scope</label>
              {syllabusMode === "specific" && (
                <span className="text-xs text-zinc-400 font-light">
                  <span className="text-white font-medium">{selectedSubSubtopics.size}</span> of {allSubSubtopicList.length} sub-subtopics selected
                </span>
              )}
            </div>

            <div className="flex gap-6 border-b border-zinc-800/80 pb-3">
              <button 
                onClick={() => setSyllabusMode("full")}
                className={`text-sm sm:text-base font-light tracking-wide transition ${syllabusMode === "full" ? "text-white border-b-2 border-white pb-1 font-normal" : "text-zinc-500 hover:text-zinc-300 pb-1"}`}
              >
                Full Syllabus
              </button>
              <button 
                onClick={() => setSyllabusMode("specific")}
                className={`text-sm sm:text-base font-light tracking-wide transition ${syllabusMode === "specific" ? "text-white border-b-2 border-white pb-1 font-normal" : "text-zinc-500 hover:text-zinc-300 pb-1"}`}
              >
                Specific Topics & Sub-subtopics
              </button>
            </div>
            
            {syllabusMode === "specific" && (
              <div className="space-y-4 pt-2">
                {/* Search & Actions Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search subjects, subtopics or sub-subtopics (e.g. photoelectric, schrödinger)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 transition"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-light">
                    <button 
                      onClick={selectAll}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                    >
                      Select All
                    </button>
                    <button 
                      onClick={clearAll}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={expandAll}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                    >
                      Expand All
                    </button>
                    <button 
                      onClick={collapseAll}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                    >
                      Collapse
                    </button>
                  </div>
                </div>

                {/* Hierarchical Syllabus Tree */}
                <div className="max-h-72 overflow-y-auto space-y-2 pr-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-3">
                  {syllabus.map(subject => {
                    const subSubList = subjectMap[subject.id] || [];
                    const selectedCount = subSubList.filter(s => selectedSubSubtopics.has(s)).length;
                    const isAll = subSubList.length > 0 && selectedCount === subSubList.length;
                    const isPartial = selectedCount > 0 && selectedCount < subSubList.length;

                    // Search filtering
                    const matchesSubject = !qLower || subject.name.toLowerCase().includes(qLower);
                    
                    // Filter subtopics
                    const subtopicsEntries = Object.entries(subject.subSubtopics || {}).filter(([st, subs]) => {
                      if (!qLower) return true;
                      if (matchesSubject) return true;
                      if (st.toLowerCase().includes(qLower)) return true;
                      return subs.some(s => s.toLowerCase().includes(qLower));
                    });

                    if (subtopicsEntries.length === 0 && !matchesSubject) {
                      return null;
                    }

                    const isExpanded = expandedSubjects.has(subject.id) || qLower.length > 0;

                    return (
                      <div key={subject.id} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
                        {/* Subject Header Row */}
                        <div className="flex items-center justify-between p-3 hover:bg-white/[0.02] transition">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleExpandSubject(subject.id)}
                              className="text-zinc-500 hover:text-white p-1 transition"
                            >
                              <svg 
                                className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>

                            {/* Checkbox */}
                            <div 
                              onClick={() => toggleSubject(subject.id)}
                              className="relative flex items-center justify-center w-5 h-5 cursor-pointer"
                            >
                              <div className={`absolute inset-0 rounded-md border transition-all ${
                                isAll 
                                  ? "border-white bg-white" 
                                  : isPartial 
                                  ? "border-zinc-400 bg-zinc-800" 
                                  : "border-zinc-700 hover:border-zinc-500"
                              }`} />
                              {isAll && (
                                <svg className="w-3.5 h-3.5 text-black relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {isPartial && (
                                <div className="w-2.5 h-0.5 bg-white relative z-10 rounded-full" />
                              )}
                            </div>

                            <span 
                              onClick={() => toggleExpandSubject(subject.id)}
                              className="text-sm font-medium text-white tracking-wide cursor-pointer hover:text-zinc-200 select-none"
                            >
                              {subject.name}
                            </span>
                          </div>

                          <span className="text-[11px] text-zinc-500 font-light pr-2">
                            {selectedCount} / {subSubList.length}
                          </span>
                        </div>

                        {/* Subtopics List (Expanded) */}
                        {isExpanded && (
                          <div className="pl-6 pr-3 pb-3 space-y-2 border-t border-zinc-800/40 pt-2 bg-black/20">
                            {subtopicsEntries.map(([subtopicName, subSubs]) => {
                              const stSelectedCount = subSubs.filter(s => selectedSubSubtopics.has(s)).length;
                              const isStAll = subSubs.length > 0 && stSelectedCount === subSubs.length;
                              const isStPartial = stSelectedCount > 0 && stSelectedCount < subSubs.length;
                              const isStExpanded = expandedSubtopics.has(subtopicName) || qLower.length > 0;

                              // Filter sub-subtopics when searching
                              const displayedSubSubs = qLower 
                                ? subSubs.filter(s => s.toLowerCase().includes(qLower) || subtopicName.toLowerCase().includes(qLower) || matchesSubject)
                                : subSubs;

                              return (
                                <div key={subtopicName} className="rounded-xl border border-zinc-800/40 bg-zinc-950/40 p-2.5">
                                  {/* Subtopic Header */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <button
                                        type="button"
                                        onClick={() => toggleExpandSubtopic(subtopicName)}
                                        className="text-zinc-500 hover:text-white p-0.5 transition"
                                      >
                                        <svg 
                                          className={`w-3.5 h-3.5 transition-transform ${isStExpanded ? "rotate-90" : ""}`}
                                          fill="none" 
                                          viewBox="0 0 24 24" 
                                          stroke="currentColor"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </button>

                                      <div 
                                        onClick={() => toggleSubtopic(subtopicName)}
                                        className="relative flex items-center justify-center w-4 h-4 cursor-pointer"
                                      >
                                        <div className={`absolute inset-0 rounded border transition-all ${
                                          isStAll 
                                            ? "border-zinc-200 bg-zinc-200" 
                                            : isStPartial 
                                            ? "border-zinc-400 bg-zinc-800" 
                                            : "border-zinc-700 hover:border-zinc-500"
                                        }`} />
                                        {isStAll && (
                                          <svg className="w-3 h-3 text-black relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                        {isStPartial && (
                                          <div className="w-2 h-0.5 bg-white relative z-10 rounded-full" />
                                        )}
                                      </div>

                                      <span 
                                        onClick={() => toggleExpandSubtopic(subtopicName)}
                                        className="text-xs text-zinc-300 font-light hover:text-white cursor-pointer select-none"
                                      >
                                        {subtopicName}
                                      </span>
                                    </div>

                                    <span className="text-[10px] text-zinc-500 font-light">
                                      {stSelectedCount} / {subSubs.length}
                                    </span>
                                  </div>

                                  {/* Sub-subtopics List (Expanded) */}
                                  {isStExpanded && (
                                    <div className="mt-2.5 pl-6 space-y-1.5 border-t border-zinc-800/30 pt-2">
                                      {displayedSubSubs.map(subSubName => {
                                        const isSelected = selectedSubSubtopics.has(subSubName);

                                        return (
                                          <div 
                                            key={subSubName}
                                            onClick={() => toggleSubSubtopic(subSubName)}
                                            className="flex items-center gap-2.5 py-1 px-1.5 rounded-lg hover:bg-white/[0.03] cursor-pointer group"
                                          >
                                            <div className="relative flex items-center justify-center w-3.5 h-3.5">
                                              <div className={`absolute inset-0 rounded-[3px] border transition-all ${
                                                isSelected 
                                                  ? "border-white bg-white" 
                                                  : "border-zinc-700 group-hover:border-zinc-500"
                                              }`} />
                                              {isSelected && (
                                                <svg className="w-2.5 h-2.5 text-black relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                              )}
                                            </div>
                                            <span className={`text-[11px] font-light tracking-wide transition select-none ${
                                              isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                                            }`}>
                                              {subSubName}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Question Count & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div className="space-y-3">
              <label className="text-xs font-medium text-zinc-400 tracking-[0.2em] uppercase">Questions</label>
              <input 
                type="number" 
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full bg-transparent border-b border-zinc-800 pb-2 text-white text-xl font-light outline-none focus:border-white transition placeholder-zinc-700"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-medium text-zinc-400 tracking-[0.2em] uppercase">Duration (Mins)</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setDuration(Math.max(5, duration - 5))}
                  className="w-8 h-8 rounded-full border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition flex items-center justify-center text-lg"
                >-</button>
                <input 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(Math.max(5, Number(e.target.value)))}
                  className="w-16 bg-transparent border-b border-zinc-800 pb-2 text-center text-white text-xl font-light outline-none focus:border-white transition"
                />
                <button 
                  onClick={() => setDuration(duration + 5)}
                  className="w-8 h-8 rounded-full border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition flex items-center justify-center text-lg"
                >+</button>
              </div>
            </div>
          </div>

          {/* Question Types */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-zinc-400 tracking-[0.2em] uppercase">Types</label>
            <div className="flex gap-4">
              {["MCQ", "MSQ", "NAT"].map(type => (
                <button 
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-light tracking-wide transition border ${
                    types.includes(type) 
                      ? "border-white bg-white text-black font-normal" 
                      : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Years */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-zinc-400 tracking-[0.2em] uppercase">Years</label>
            <div className="flex flex-wrap gap-4">
              {["All", "Last 3", "Last 5", "Custom"].map(mode => (
                <button 
                  key={mode}
                  onClick={() => setYearMode(mode)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-light tracking-wide transition border ${
                    yearMode === mode 
                      ? "border-white bg-white text-black font-normal" 
                      : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            {yearMode === "Custom" && (
              <div className="flex items-center gap-4 mt-3">
                <input 
                  type="number" 
                  value={customYearStart}
                  onChange={(e) => setCustomYearStart(Number(e.target.value))}
                  min={2018}
                  max={2026}
                  className="w-24 bg-transparent border-b border-zinc-800 pb-1.5 text-white text-base font-light outline-none focus:border-white transition text-center"
                />
                <span className="text-zinc-500 font-light tracking-wide text-xs">to</span>
                <input 
                  type="number" 
                  value={customYearEnd}
                  onChange={(e) => setCustomYearEnd(Number(e.target.value))}
                  min={2018}
                  max={2026}
                  className="w-24 bg-transparent border-b border-zinc-800 pb-1.5 text-white text-base font-light outline-none focus:border-white transition text-center"
                />
              </div>
            )}
          </div>

        </div>

        <div className="mt-10 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-sm font-light text-zinc-500 hover:text-zinc-300 transition"
          >
            Cancel
          </button>

          <button 
            onClick={handleGenerate}
            disabled={types.length === 0 || (syllabusMode === "specific" && selectedSubSubtopics.size === 0) || numQuestions < 1 || duration < 5}
            className="px-6 py-2.5 rounded-2xl bg-white text-black text-sm font-medium tracking-wide uppercase hover:bg-zinc-200 transition disabled:opacity-20 disabled:cursor-not-allowed group flex items-center gap-2"
          >
            Start
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
