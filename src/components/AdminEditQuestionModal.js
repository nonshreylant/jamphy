"use client";

import { useEffect, useRef, useState } from "react";
import { syllabus, getSubjectForSubtopic } from "@/data/syllabus";
import { applyOverrideToQuestion, getQuestionKey } from "@/lib/questionOverrides";
import MathText from "./MathText";

export function AdminQuestionMenu({ onEdit, className = "" }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div
      ref={menuRef}
      className={`relative ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Admin question options"
        title="Admin options"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 py-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onEdit();
            }}
            className="w-full px-3.5 py-2.5 text-left text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white flex items-center justify-between gap-2 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Question
            </span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[9px] font-bold uppercase tracking-wider">
              Admin
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminEditQuestionModal({ question, onClose, onSaved }) {
  const initialSubjectObj =
    syllabus.find((s) => s.id === question?.subjectId) ||
    getSubjectForSubtopic(question?.subject) ||
    syllabus[0];

  const initialSubtopic = initialSubjectObj.subtopics.includes(question?.subject)
    ? question.subject
    : initialSubjectObj.subtopics[0];

  const initialSubSubList = initialSubjectObj.subSubtopics?.[initialSubtopic] || [];
  const initialSubSubtopic = initialSubSubList.includes(question?.subSubtopic)
    ? question.subSubtopic
    : initialSubSubList[0] || "";

  const [subjectId, setSubjectId] = useState(initialSubjectObj.id);
  const [subtopic, setSubtopic] = useState(initialSubtopic);
  const [subSubtopic, setSubSubtopic] = useState(initialSubSubtopic);
  const [difficulty, setDifficulty] = useState(question?.difficulty || "Medium");
  const [marks, setMarks] = useState(question?.marks ? String(question.marks) : "1");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const currentSubjectObj =
    syllabus.find((s) => s.id === subjectId) || syllabus[0];
  const availableSubtopics = currentSubjectObj.subtopics || [];
  const availableSubSubtopics =
    currentSubjectObj.subSubtopics?.[subtopic] || [];

  const handleSubjectChange = (nextSubjectId) => {
    setSubjectId(nextSubjectId);
    const nextSubjectObj =
      syllabus.find((s) => s.id === nextSubjectId) || syllabus[0];
    const nextSubtopic = nextSubjectObj.subtopics[0] || "";
    setSubtopic(nextSubtopic);
    const nextSubSubs = nextSubjectObj.subSubtopics?.[nextSubtopic] || [];
    setSubSubtopic(nextSubSubs[0] || "");
  };

  const handleSubtopicChange = (nextSubtopic) => {
    setSubtopic(nextSubtopic);
    const nextSubSubs = currentSubjectObj.subSubtopics?.[nextSubtopic] || [];
    setSubSubtopic(nextSubSubs[0] || "");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const questionKey = getQuestionKey(question);
      const res = await fetch("/api/admin/questions/override", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionKey,
          questionId: typeof question.id === "string" ? question.id : undefined,
          subjectId,
          subject: subtopic,
          subSubtopic: subSubtopic || null,
          difficulty,
          marks: Number(marks),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save question changes.");
      }

      const updatedQuestion = applyOverrideToQuestion(question, data.override);
      onSaved(updatedQuestion, data.override);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={() => !isSaving && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-2">
              Admin Question Transfer
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Edit Question Categorization
            </h3>
          </div>
          <button
            type="button"
            onClick={() => !isSaving && onClose()}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Question Preview */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 mb-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] font-medium text-zinc-300">
              {question.year} • Q#{question.id}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] font-medium text-zinc-400">
              {question.type}
            </span>
          </div>
          <MathText className="text-xs sm:text-sm text-zinc-300 line-clamp-2 overflow-hidden leading-relaxed">
            {question.question}
          </MathText>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-600 transition font-medium"
            >
              {syllabus.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  {subj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subtopic */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Subtopic
            </label>
            <select
              value={subtopic}
              onChange={(e) => handleSubtopicChange(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-600 transition font-medium"
            >
              {availableSubtopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-subtopic */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Sub-subtopic
            </label>
            <select
              value={subSubtopic}
              onChange={(e) => setSubSubtopic(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-600 transition font-medium"
            >
              <option value="">None</option>
              {availableSubSubtopics.map((subSub) => (
                <option key={subSub} value={subSub}>
                  {subSub}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty & Marks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-600 transition font-medium"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Marks
              </label>
              <select
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-600 transition font-medium"
              >
                <option value="1">1 Mark</option>
                <option value="2">2 Marks</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-3 rounded-2xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && (
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              )}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
