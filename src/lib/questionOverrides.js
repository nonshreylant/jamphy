import { syllabus } from "@/data/syllabus";

export function getQuestionKey(question) {
  if (!question) return "";
  return `${question.year}-${question.id}`;
}

export function applyOverrideToQuestion(question, override) {
  if (!question || !override) return question;

  const nextSubjectId = override.subjectId || question.subjectId;
  const nextSubject = override.subject || question.subject;
  const nextSubSubtopic =
    override.subSubtopic !== undefined ? override.subSubtopic : question.subSubtopic;
  const nextDifficulty = override.difficulty || question.difficulty;
  const nextMarks =
    override.marks !== undefined && override.marks !== null
      ? override.marks
      : question.marks;

  const subjectObj = syllabus.find((s) => s.id === nextSubjectId);
  const nextTags = [
    nextSubject,
    subjectObj?.name,
    nextSubSubtopic,
  ].filter(Boolean);

  return {
    ...question,
    subjectId: nextSubjectId,
    subject: nextSubject,
    subSubtopic: nextSubSubtopic || undefined,
    difficulty: nextDifficulty,
    marks: nextMarks,
    tags: nextTags.length > 0 ? nextTags : question.tags,
  };
}

export function applyOverridesToList(questionsList, overridesMap) {
  if (!overridesMap || Object.keys(overridesMap).length === 0) {
    return questionsList;
  }

  return questionsList.map((q) => {
    const key = getQuestionKey(q);
    const override = overridesMap[key];
    return override ? applyOverrideToQuestion(q, override) : q;
  });
}
