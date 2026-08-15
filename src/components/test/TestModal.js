import { useState } from "react";
import { syllabus } from "../../data/syllabus";

export default function TestModal({ onClose, onGenerate, title = "Create Test" }) {
  const [syllabusMode, setSyllabusMode] = useState("full");
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [numQuestions, setNumQuestions] = useState(30);
  const [types, setTypes] = useState(["MCQ", "MSQ", "NAT"]);
  const [duration, setDuration] = useState(5);
  const [yearMode, setYearMode] = useState("All");
  const [customYearStart, setCustomYearStart] = useState(2018);
  const [customYearEnd, setCustomYearEnd] = useState(2026);

  const handleChapterToggle = (chapterId) => {
    if (selectedChapters.includes(chapterId)) {
      setSelectedChapters(selectedChapters.filter(id => id !== chapterId));
    } else {
      setSelectedChapters([...selectedChapters, chapterId]);
    }
  };

  const handleTypeToggle = (type) => {
    if (types.includes(type)) {
      setTypes(types.filter(t => t !== type));
    } else {
      setTypes([...types, type]);
    }
  };

  const handleGenerate = () => {
    onGenerate({
      syllabusMode,
      selectedChapters,
      numQuestions,
      types,
      duration,
      yearMode,
      customYearStart,
      customYearEnd,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-xl flex flex-col items-center justify-center p-6 overflow-y-auto font-sans text-zinc-100">
      <div className="w-full max-w-4xl flex flex-col my-8 mt-16">
        
        <div className="flex items-start justify-between mb-12">
          <div className="flex items-baseline gap-4">
            <h2 className="text-3xl font-light tracking-wide">{title}</h2>
            <p className="text-zinc-400 font-light tracking-wider text-xs uppercase pt-1">
              {title === "Create Test" ? "Generate a personalized practice exam" : "Compete with others in real-time"}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-12">
          {/* Syllabus Selection */}
          <div className="space-y-4">
            <label className="text-xs font-medium text-zinc-500 tracking-[0.2em] uppercase">Syllabus</label>
            <div className="flex gap-6">
              <button 
                onClick={() => setSyllabusMode("full")}
                className={`text-base font-light tracking-wide transition ${syllabusMode === "full" ? "text-white border-b border-white pb-1" : "text-zinc-500 hover:text-zinc-300 pb-1"}`}
              >
                Full Syllabus
              </button>
              <button 
                onClick={() => setSyllabusMode("specific")}
                className={`text-base font-light tracking-wide transition ${syllabusMode === "specific" ? "text-white border-b border-white pb-1" : "text-zinc-500 hover:text-zinc-300 pb-1"}`}
              >
                Specific Chapters
              </button>
            </div>
            
            {syllabusMode === "specific" && (
              <div className="grid grid-cols-2 gap-4 mt-6 max-h-64 overflow-y-auto scrollbar-hide">
                {syllabus.map(subject => (
                  <div key={subject.id} onClick={() => handleChapterToggle(subject.id)} className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-6 h-6">
                      <div className={`absolute inset-0 border transition-all ${selectedChapters.includes(subject.id) ? "border-white bg-white" : "border-zinc-700 group-hover:border-zinc-500"}`}></div>
                      {selectedChapters.includes(subject.id) && (
                        <svg className="w-4 h-4 text-black relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                    <span className="text-sm text-zinc-300 font-light tracking-wide select-none group-hover:text-white transition">{subject.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question Count & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-xs font-medium text-zinc-500 tracking-[0.2em] uppercase">Questions</label>
              <input 
                type="number" 
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full bg-transparent border-b border-zinc-700 pb-2 text-white text-xl font-light outline-none focus:border-white transition placeholder-zinc-700"
              />
            </div>
            
            <div className="space-y-4">
              <label className="text-xs font-medium text-zinc-500 tracking-[0.2em] uppercase">Duration (Mins)</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setDuration(Math.max(5, duration - 5))}
                  className="text-zinc-500 hover:text-white transition text-xl font-light"
                >-</button>
                <input 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(Math.max(5, Number(e.target.value)))}
                  className="w-20 bg-transparent border-b border-zinc-700 pb-2 text-center text-white text-xl font-light outline-none focus:border-white transition"
                />
                <button 
                  onClick={() => setDuration(duration + 5)}
                  className="text-zinc-500 hover:text-white transition text-xl font-light"
                >+</button>
              </div>
            </div>
          </div>

          {/* Question Types */}
          <div className="space-y-4">
            <label className="text-xs font-medium text-zinc-500 tracking-[0.2em] uppercase">Types</label>
            <div className="flex gap-6">
              {["MCQ", "MSQ", "NAT"].map(type => (
                <button 
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`text-base font-light tracking-wide transition ${types.includes(type) ? "text-white border-b border-white pb-1" : "text-zinc-500 hover:text-zinc-300 pb-1"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Years */}
          <div className="space-y-4">
            <label className="text-xs font-medium text-zinc-500 tracking-[0.2em] uppercase">Years</label>
            <div className="flex flex-wrap gap-6">
              {["All", "Last 3", "Last 5", "Custom"].map(mode => (
                <button 
                  key={mode}
                  onClick={() => setYearMode(mode)}
                  className={`text-base font-light tracking-wide transition ${yearMode === mode ? "text-white border-b border-white pb-1" : "text-zinc-500 hover:text-zinc-300 pb-1"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            {yearMode === "Custom" && (
              <div className="flex items-center gap-4 mt-4">
                <input 
                  type="number" 
                  value={customYearStart}
                  onChange={(e) => setCustomYearStart(Number(e.target.value))}
                  min={2018}
                  max={2026}
                  className="w-24 bg-transparent border-b border-zinc-700 pb-2 text-white text-lg font-light outline-none focus:border-white transition text-center"
                />
                <span className="text-zinc-500 font-light tracking-wide text-sm">to</span>
                <input 
                  type="number" 
                  value={customYearEnd}
                  onChange={(e) => setCustomYearEnd(Number(e.target.value))}
                  min={2018}
                  max={2026}
                  className="w-24 bg-transparent border-b border-zinc-700 pb-2 text-white text-lg font-light outline-none focus:border-white transition text-center"
                />
              </div>
            )}
          </div>

        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleGenerate}
            disabled={types.length === 0 || (syllabusMode === "specific" && selectedChapters.length === 0) || numQuestions < 1 || duration < 5}
            className="text-2xl font-light tracking-widest text-white uppercase hover:text-zinc-400 transition disabled:opacity-20 disabled:cursor-not-allowed group flex items-center gap-3"
          >
            Start
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
