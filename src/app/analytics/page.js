"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area, Legend, PieChart, Pie
} from 'recharts';
import ActivityRing from "@/components/ActivityRing";
import { questions } from "@/data/questions";
import { syllabus } from "@/data/syllabus";

// 7 IIT JAM Subjects with dedicated curated color tokens
const SUBJECT_CONFIG = {
  math: {
    id: "math",
    name: "Mathematical Methods",
    shortName: "Math Methods",
    color: "#38bdf8", // Sky Blue
    icon: "∫",
    bg: "rgba(56, 189, 248, 0.12)",
    border: "rgba(56, 189, 248, 0.25)"
  },
  mechanics: {
    id: "mechanics",
    name: "Mechanics & General Properties",
    shortName: "Mechanics",
    color: "#a855f7", // Purple
    icon: "⚛",
    bg: "rgba(168, 85, 247, 0.12)",
    border: "rgba(168, 85, 247, 0.25)"
  },
  waves: {
    id: "waves",
    name: "Oscillations, Waves & Optics",
    shortName: "Waves & Optics",
    color: "#06b6d4", // Cyan
    icon: "〰",
    bg: "rgba(6, 182, 212, 0.12)",
    border: "rgba(6, 182, 212, 0.25)"
  },
  em: {
    id: "em",
    name: "Electricity & Magnetism",
    shortName: "Electromagnetism",
    color: "#eab308", // Yellow
    icon: "⚡",
    bg: "rgba(234, 179, 8, 0.12)",
    border: "rgba(234, 179, 8, 0.25)"
  },
  thermo: {
    id: "thermo",
    name: "Thermodynamics & KTG",
    shortName: "Thermodynamics",
    color: "#f97316", // Orange
    icon: "🔥",
    bg: "rgba(249, 115, 22, 0.12)",
    border: "rgba(249, 115, 22, 0.25)"
  },
  modern: {
    id: "modern",
    name: "Modern Physics",
    shortName: "Modern Physics",
    color: "#ec4899", // Pink
    icon: "☄",
    bg: "rgba(236, 72, 153, 0.12)",
    border: "rgba(236, 72, 153, 0.25)"
  },
  solid: {
    id: "solid",
    name: "Solid State & Electronics",
    shortName: "Solid State & Electronics",
    color: "#10b981", // Emerald
    icon: "⌁",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.25)"
  }
};

const DIFFICULTY_COLORS = {
  Easy: { color: "#34d399", bg: "rgba(52, 211, 153, 0.12)", border: "rgba(52, 211, 153, 0.25)", label: "Easy" },
  Medium: { color: "#fbbf24", bg: "rgba(251, 191, 36, 0.12)", border: "rgba(251, 191, 36, 0.25)", label: "Medium" },
  Hard: { color: "#f87171", bg: "rgba(248, 113, 113, 0.12)", border: "rgba(248, 113, 113, 0.25)", label: "Hard" }
};

const CustomPerformanceTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-zinc-400 text-xs font-medium mb-1">{label}</p>
        <p className="text-cyan-400 font-bold text-sm">{`${payload[0].value}% Accuracy`}</p>
      </div>
    );
  }
  return null;
};

const CustomYearChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc, curr) => acc + (typeof curr.value === 'number' ? curr.value : 0), 0);
    return (
      <div className="bg-zinc-950/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl backdrop-blur-xl min-w-[220px]">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2.5">
          <span className="text-white font-bold text-sm">IIT JAM {label}</span>
          <span className="text-xs text-zinc-400 font-medium">{total} Questions</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-zinc-300 truncate max-w-[130px]">{entry.name}</span>
              </div>
              <span className="font-bold text-white ml-2">
                {entry.value} <span className="text-zinc-500 font-normal">({total > 0 ? Math.round((entry.value / total) * 100) : 0}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function AnalyticsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("jam"); // "jam" | "personal"
  const [selectedChartType, setSelectedChartType] = useState("stacked"); // "stacked" | "grouped" | "trend"
  const [selectedYearFilter, setSelectedYearFilter] = useState("All");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("All");

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data: personalData, isLoading: isPersonalLoading } = useSWR(
    status === "authenticated" && activeTab === "personal" ? "/api/analytics" : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "personal") {
      setActiveTab("personal");
    } else if (tabParam === "jam") {
      setActiveTab("jam");
    }
  }, [searchParams]);

  // Aggregate JAM Exam Analytics from questions dataset
  const jamStats = useMemo(() => {
    const totalQuestions = questions.length;
    
    // Difficulty breakdown
    const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
    questions.forEach(q => {
      if (q.difficulty && difficultyCounts[q.difficulty] !== undefined) {
        difficultyCounts[q.difficulty]++;
      }
    });

    // Subject counts & breakdown
    const subjectCounts = {};
    Object.keys(SUBJECT_CONFIG).forEach(id => {
      subjectCounts[id] = { ...SUBJECT_CONFIG[id], count: 0, easy: 0, medium: 0, hard: 0 };
    });

    questions.forEach(q => {
      const sId = q.subjectId || "solid";
      if (subjectCounts[sId]) {
        subjectCounts[sId].count++;
        if (q.difficulty === "Easy") subjectCounts[sId].easy++;
        else if (q.difficulty === "Medium") subjectCounts[sId].medium++;
        else if (q.difficulty === "Hard") subjectCounts[sId].hard++;
      }
    });

    // Years available (2018–2026)
    const years = [...new Set(questions.map(q => q.year))].sort((a, b) => a - b);

    // Year-by-year subject matrix data for charts
    const yearlySubjectData = years.map(yr => {
      const qOfYear = questions.filter(q => q.year === yr);
      const row = {
        year: yr.toString(),
        total: qOfYear.length,
      };

      Object.keys(SUBJECT_CONFIG).forEach(sId => {
        const count = qOfYear.filter(q => q.subjectId === sId).length;
        row[SUBJECT_CONFIG[sId].shortName] = count;
        row[sId] = count;
      });

      // Difficulties in this year
      row.easy = qOfYear.filter(q => q.difficulty === "Easy").length;
      row.medium = qOfYear.filter(q => q.difficulty === "Medium").length;
      row.hard = qOfYear.filter(q => q.difficulty === "Hard").length;

      return row;
    });

    // Subtopic distribution leaderboard
    const subtopicMap = {};
    questions.forEach(q => {
      const sub = q.subject || "General";
      if (!subtopicMap[sub]) {
        subtopicMap[sub] = {
          name: sub,
          subjectId: q.subjectId || "solid",
          count: 0,
          easy: 0,
          medium: 0,
          hard: 0,
          marksTotal: 0
        };
      }
      subtopicMap[sub].count++;
      subtopicMap[sub].marksTotal += (q.marks || 1);
      if (q.difficulty === "Easy") subtopicMap[sub].easy++;
      else if (q.difficulty === "Medium") subtopicMap[sub].medium++;
      else if (q.difficulty === "Hard") subtopicMap[sub].hard++;
    });

    const rankedTopics = Object.values(subtopicMap).sort((a, b) => b.count - a.count);

    // Question Type Breakdown
    const typeCounts = {
      MCQ1: questions.filter(q => q.type === "MCQ" && q.marks === 1).length,
      MCQ2: questions.filter(q => q.type === "MCQ" && q.marks === 2).length,
      MSQ: questions.filter(q => q.type === "MSQ").length,
      NAT1: questions.filter(q => q.type === "NAT" && q.marks === 1).length,
      NAT2: questions.filter(q => q.type === "NAT" && q.marks === 2).length,
    };

    return {
      totalQuestions,
      years,
      difficultyCounts,
      subjectCounts,
      yearlySubjectData,
      rankedTopics,
      typeCounts
    };
  }, []);

  // Filtered chart data based on user selection
  const activeYearData = useMemo(() => {
    if (selectedYearFilter === "All") {
      return jamStats.yearlySubjectData;
    }
    return jamStats.yearlySubjectData.filter(d => d.year === selectedYearFilter);
  }, [jamStats, selectedYearFilter]);

  // Selected year deep dive stats
  const selectedYearSummary = useMemo(() => {
    if (selectedYearFilter === "All") return null;
    const qOfYear = questions.filter(q => q.year === Number(selectedYearFilter));
    const easy = qOfYear.filter(q => q.difficulty === "Easy").length;
    const med = qOfYear.filter(q => q.difficulty === "Medium").length;
    const hard = qOfYear.filter(q => q.difficulty === "Hard").length;
    
    const subjectList = Object.keys(SUBJECT_CONFIG).map(sId => {
      const count = qOfYear.filter(q => q.subjectId === sId).length;
      return {
        ...SUBJECT_CONFIG[sId],
        count,
        percentage: Math.round((count / qOfYear.length) * 100)
      };
    }).sort((a, b) => b.count - a.count);

    return { total: qOfYear.length, easy, med, hard, subjectList };
  }, [selectedYearFilter]);

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-10 font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-zinc-800/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Comprehensive Paper Insights
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              IIT JAM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">Analytics Hub</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base mt-1 font-light">
              9-Year Exam Distribution (2018–2026), Subject Weightages & Difficulty Insights
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link 
              href="/questions" 
              className="px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-2"
            >
              <span>Explore Questions</span>
              <span className="text-zinc-500">→</span>
            </Link>
            <Link 
              href="/" 
              className="px-4 py-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all text-xs font-medium"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 w-fit">
          <button
            onClick={() => setActiveTab("jam")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "jam"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <span>🎯</span>
            <span>JAM Exam Paper Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "personal"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <span>📈</span>
            <span>My Performance</span>
            {session?.user && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: JAM EXAM ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === "jam" && (
          <div className="space-y-10">

            {/* Top Stat Cards: Difficulty & Overall Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              {/* Total Questions Card */}
              <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Questions</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                    9 Years
                  </span>
                </div>
                <p className="text-4xl font-black text-white tracking-tight">{jamStats.totalQuestions}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                  <span>60 Qs / Year</span>
                  <span className="text-zinc-600">•</span>
                  <span>900 Total Marks</span>
                </div>
              </div>

              {/* Easy Questions Card */}
              <Link 
                href="/questions"
                className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-emerald-500/20 hover:border-emerald-500/50 rounded-3xl p-6 relative overflow-hidden transition-all group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Easy Questions
                  </span>
                  <span className="text-xs text-zinc-500 group-hover:text-emerald-400 transition-colors font-medium">Practice →</span>
                </div>
                <p className="text-4xl font-black text-emerald-400 tracking-tight">{jamStats.difficultyCounts.Easy}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                  <span>{Math.round((jamStats.difficultyCounts.Easy / jamStats.totalQuestions) * 100)}% of all questions</span>
                  <span className="text-emerald-400/80 font-semibold">~17 Qs / paper</span>
                </div>
              </Link>

              {/* Medium Questions Card */}
              <Link 
                href="/questions"
                className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-amber-500/20 hover:border-amber-500/50 rounded-3xl p-6 relative overflow-hidden transition-all group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Medium Questions
                  </span>
                  <span className="text-xs text-zinc-500 group-hover:text-amber-400 transition-colors font-medium">Practice →</span>
                </div>
                <p className="text-4xl font-black text-amber-400 tracking-tight">{jamStats.difficultyCounts.Medium}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                  <span>{Math.round((jamStats.difficultyCounts.Medium / jamStats.totalQuestions) * 100)}% of all questions</span>
                  <span className="text-amber-400/80 font-semibold">~23 Qs / paper</span>
                </div>
              </Link>

              {/* Hard Questions Card */}
              <Link 
                href="/questions"
                className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-rose-500/20 hover:border-rose-500/50 rounded-3xl p-6 relative overflow-hidden transition-all group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-rose-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    Hard Questions
                  </span>
                  <span className="text-xs text-zinc-500 group-hover:text-rose-400 transition-colors font-medium">Practice →</span>
                </div>
                <p className="text-4xl font-black text-rose-400 tracking-tight">{jamStats.difficultyCounts.Hard}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                  <span>{Math.round((jamStats.difficultyCounts.Hard / jamStats.totalQuestions) * 100)}% of all questions</span>
                  <span className="text-rose-400/80 font-semibold">~20 Qs / paper</span>
                </div>
              </Link>

            </div>

            {/* MAIN SECTION: Subject Breakdown Over The Years (2018–2026) */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 sm:p-8 space-y-6">
              
              {/* Controls bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <span>📊</span>
                    <span>Subject Distribution Over The Years</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Year-by-year question count and weightage across all 7 core subjects
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Chart Style Switcher */}
                  <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">
                    <button
                      onClick={() => setSelectedChartType("stacked")}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        selectedChartType === "stacked" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Stacked
                    </button>
                    <button
                      onClick={() => setSelectedChartType("grouped")}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        selectedChartType === "grouped" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Grouped
                    </button>
                    <button
                      onClick={() => setSelectedChartType("trend")}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        selectedChartType === "trend" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Trends
                    </button>
                  </div>

                  {/* Year selector */}
                  <select
                    value={selectedYearFilter}
                    onChange={(e) => setSelectedYearFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white px-3.5 py-2 rounded-xl outline-none focus:border-cyan-500/50"
                  >
                    <option value="All">All Years (2018–2026)</option>
                    {jamStats.years.map(y => (
                      <option key={y} value={y.toString()}>IIT JAM {y}</option>
                    ))}
                  </select>

                </div>
              </div>

              {/* Chart Visualization Area */}
              <div style={{ width: '100%', height: 380 }} className="pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedChartType === "stacked" ? (
                    <BarChart data={activeYearData} margin={{ top: 20, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" vertical={false} />
                      <XAxis dataKey="year" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[0, 65]} />
                      <Tooltip content={<CustomYearChartTooltip />} />
                      {Object.keys(SUBJECT_CONFIG).map(sId => (
                        <Bar
                          key={sId}
                          dataKey={SUBJECT_CONFIG[sId].shortName}
                          stackId="a"
                          fill={SUBJECT_CONFIG[sId].color}
                          radius={[0, 0, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  ) : selectedChartType === "grouped" ? (
                    <BarChart data={activeYearData} margin={{ top: 20, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" vertical={false} />
                      <XAxis dataKey="year" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomYearChartTooltip />} />
                      {Object.keys(SUBJECT_CONFIG).map(sId => (
                        <Bar
                          key={sId}
                          dataKey={SUBJECT_CONFIG[sId].shortName}
                          fill={SUBJECT_CONFIG[sId].color}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  ) : (
                    <LineChart data={activeYearData} margin={{ top: 20, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" vertical={false} />
                      <XAxis dataKey="year" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomYearChartTooltip />} />
                      {Object.keys(SUBJECT_CONFIG).map(sId => (
                        <Line
                          key={sId}
                          type="monotone"
                          dataKey={SUBJECT_CONFIG[sId].shortName}
                          stroke={SUBJECT_CONFIG[sId].color}
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: SUBJECT_CONFIG[sId].color }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Subject Color Badges Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-3 border-t border-zinc-800/80">
                {Object.keys(SUBJECT_CONFIG).map(sId => {
                  const item = jamStats.subjectCounts[sId];
                  return (
                    <div
                      key={sId}
                      className="p-3 rounded-2xl border flex flex-col justify-between transition-all"
                      style={{ backgroundColor: item.bg, borderColor: item.border }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-xs font-bold truncate text-white" title={item.name}>
                          {item.shortName}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-lg font-black text-white">{item.count}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {Math.round((item.count / jamStats.totalQuestions) * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Single Year Drill-down Card (when a year is selected) */}
            {selectedYearSummary && (
              <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-cyan-500/30 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Exam Breakdown</span>
                    <h3 className="text-2xl font-black text-white mt-1">IIT JAM {selectedYearFilter} Paper Deep-Dive</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                      {selectedYearSummary.easy} Easy
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                      {selectedYearSummary.med} Medium
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                      {selectedYearSummary.hard} Hard
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {selectedYearSummary.subjectList.map(subj => (
                    <div key={subj.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                      <span className="text-xs text-zinc-400 font-medium truncate">{subj.shortName}</span>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-xl font-bold" style={{ color: subj.color }}>{subj.count} Qs</span>
                        <span className="text-xs text-zinc-500">{subj.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* YEAR VS SUBJECT COMPREHENSIVE MATRIX HEATMAP TABLE */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <span>🗺️</span>
                  <span>Year-by-Year Subject Weightage Matrix</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Complete breakdown of question counts per subject for each exam year (2018–2026)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-semibold">
                      <th className="py-3 px-4">Exam Year</th>
                      {Object.keys(SUBJECT_CONFIG).map(sId => (
                        <th key={sId} className="py-3 px-3 text-center">
                          <span style={{ color: SUBJECT_CONFIG[sId].color }}>
                            {SUBJECT_CONFIG[sId].shortName}
                          </span>
                        </th>
                      ))}
                      <th className="py-3 px-4 text-right">Total Qs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-medium">
                    {jamStats.yearlySubjectData.map((row) => (
                      <tr key={row.year} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                          <span>IIT JAM {row.year}</span>
                        </td>
                        {Object.keys(SUBJECT_CONFIG).map(sId => {
                          const count = row[sId] || 0;
                          return (
                            <td key={sId} className="py-3.5 px-3 text-center">
                              <span 
                                className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  count >= 10 
                                    ? "bg-cyan-500/20 text-cyan-300 font-black border border-cyan-500/30" 
                                    : count >= 7 
                                    ? "bg-zinc-800/90 text-zinc-200" 
                                    : "bg-zinc-900/50 text-zinc-400"
                                }`}
                              >
                                {count}
                              </span>
                            </td>
                          );
                        })}
                        <td className="py-3.5 px-4 text-right font-black text-cyan-400">
                          {row.total}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Overall Summary Row */}
                    <tr className="bg-zinc-900/80 font-bold border-t-2 border-zinc-700">
                      <td className="py-4 px-4 text-white">
                        Total (9 Years)
                      </td>
                      {Object.keys(SUBJECT_CONFIG).map(sId => (
                        <td key={sId} className="py-4 px-3 text-center font-black" style={{ color: SUBJECT_CONFIG[sId].color }}>
                          {jamStats.subjectCounts[sId].count}
                        </td>
                      ))}
                      <td className="py-4 px-4 text-right font-black text-white text-base">
                        540
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* HIGH-YIELD TOPICS & SUBTOPIC BREAKDOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* High Yield Subtopics Leaderboard */}
              <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <span>🔥</span>
                    <span>High-Yield Topic Weightage</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Top tested topics in IIT JAM Physics with instant 1-click practice launch
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {jamStats.rankedTopics.slice(0, 16).map((topic, idx) => {
                    const subjCfg = SUBJECT_CONFIG[topic.subjectId] || SUBJECT_CONFIG.solid;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition flex flex-col justify-between group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {topic.name}
                          </span>
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full shrink-0 font-semibold"
                            style={{ backgroundColor: subjCfg.bg, color: subjCfg.color, borderColor: subjCfg.border }}
                          >
                            {subjCfg.shortName}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-black text-white">{topic.count} Qs</span>
                            <span className="text-zinc-500">({topic.marksTotal} Marks)</span>
                          </div>

                          <Link
                            href={`/questions`}
                            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                          >
                            Practice →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Question Format & Pattern Breakdown */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <span>📋</span>
                    <span>Exam Blueprint</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Official IIT JAM Paper Structure
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Section A */}
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                    <div className="flex items-center justify-between text-sm font-bold text-white mb-1">
                      <span>Section A (MCQs)</span>
                      <span className="text-cyan-400 font-extrabold">50 Marks</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">30 Multiple Choice Questions</p>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>10 Qs × 1 Mark (-1/3 neg)</span>
                      <span>20 Qs × 2 Marks (-2/3 neg)</span>
                    </div>
                  </div>

                  {/* Section B */}
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                    <div className="flex items-center justify-between text-sm font-bold text-white mb-1">
                      <span>Section B (MSQs)</span>
                      <span className="text-purple-400 font-extrabold">20 Marks</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">10 Multiple Select Questions</p>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>10 Qs × 2 Marks</span>
                      <span>No negative marking</span>
                    </div>
                  </div>

                  {/* Section C */}
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                    <div className="flex items-center justify-between text-sm font-bold text-white mb-1">
                      <span>Section C (NATs)</span>
                      <span className="text-amber-400 font-extrabold">30 Marks</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">20 Numerical Answer Type Questions</p>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>10 Qs × 1 Mark</span>
                      <span>10 Qs × 2 Marks</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/questions"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-center text-sm shadow-xl shadow-cyan-500/20 hover:opacity-95 transition"
                >
                  Start Solving IIT JAM Papers
                </Link>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY PERFORMANCE ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === "personal" && (
          <div className="space-y-8">
            {status === "unauthenticated" ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-12 text-center max-w-2xl mx-auto space-y-6">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-2xl flex items-center justify-center mx-auto">
                  🔒
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Sign In to Track Your Performance</h2>
                  <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
                    Log in with Google to view your personal question attempts, accuracy trends, solving speed, and weak topic recommendations.
                  </p>
                </div>
                <button
                  onClick={() => signIn("google", { callbackUrl: "/analytics?tab=personal" })}
                  className="px-6 py-3.5 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all text-sm shadow-xl shadow-white/10"
                >
                  Sign In with Google
                </button>
              </div>
            ) : isPersonalLoading || !personalData ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="h-64 bg-zinc-900 rounded-3xl animate-pulse"></div>
                  <div className="h-64 bg-zinc-900 rounded-3xl animate-pulse md:col-span-2"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-zinc-900 rounded-3xl animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Top Row: Overall Accuracy & Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                    <h2 className="text-zinc-400 font-medium mb-6 w-full text-left">Overall Accuracy</h2>
                    <ActivityRing 
                      percentage={personalData.totalAttempts > 0 ? Math.round((personalData.totalCorrect / personalData.totalAttempts) * 100) : 0} 
                      size={180} 
                      strokeWidth={14} 
                      color="#22d3ee" 
                    />
                    <p className="mt-6 text-zinc-500 text-sm">Based on {personalData.totalAttempts} total attempts</p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-8 lg:col-span-2">
                    <h2 className="text-zinc-400 font-medium mb-6">Accuracy Trend (Last 30 Days)</h2>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={personalData.dailyAccuracy} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#a1a1aa" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            minTickGap={30}
                          />
                          <YAxis 
                            stroke="#a1a1aa" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip content={<CustomPerformanceTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="accuracy" 
                            stroke="#22d3ee" 
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: "#22d3ee", stroke: "#000", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
                    <h3 className="text-zinc-400 text-sm font-medium mb-2">Total Attempted</h3>
                    <p className="text-3xl font-bold">{personalData.totalAttempts}</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
                    <h3 className="text-zinc-400 text-sm font-medium mb-2">Total Correct</h3>
                    <p className="text-3xl font-bold text-emerald-400">{personalData.totalCorrect}</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
                    <h3 className="text-zinc-400 text-sm font-medium mb-2">Avg Time / Question</h3>
                    <p className="text-3xl font-bold text-amber-400">{personalData.avgTimeTaken}s</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 text-7xl opacity-5">🔥</div>
                    <h3 className="text-zinc-400 text-sm font-medium mb-2">Current Streak</h3>
                    <p className="text-3xl font-bold text-orange-400">{personalData.streak} Days</p>
                  </div>
                </div>

                {/* Bottom Row: Subject Accuracy & Weak Topics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-8">
                    <h2 className="text-zinc-400 font-medium mb-6">Accuracy by Subject</h2>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={personalData.subjectAccuracy} margin={{ top: 5, right: 0, bottom: 5, left: -20 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis dataKey="subject" type="category" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} width={100} />
                          <Tooltip content={<CustomPerformanceTooltip />} cursor={{ fill: '#ffffff0a' }} />
                          <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={24}>
                            {personalData.subjectAccuracy.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.accuracy >= 50 ? '#34d399' : '#f87171'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-8">
                    <h2 className="text-zinc-400 font-medium mb-6">Topics to Review</h2>
                    {personalData.weakTopics && personalData.weakTopics.length > 0 ? (
                      <div className="space-y-4">
                        {personalData.weakTopics.map((topic, idx) => (
                          <Link 
                            key={idx} 
                            href={`/questions`}
                            className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors group"
                          >
                            <span className="font-medium text-lg text-zinc-200 group-hover:text-white transition-colors">{topic}</span>
                            <span className="text-zinc-500 group-hover:text-white transition-colors">→</span >
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-center">
                        <p className="font-medium text-zinc-400">Not enough data yet</p>
                        <p className="text-xs mt-1 text-zinc-500">Keep practicing questions to identify your weak topics!</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white p-6 md:p-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <span className="text-zinc-500 text-sm font-medium">Loading JAM Analytics...</span>
        </div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}
