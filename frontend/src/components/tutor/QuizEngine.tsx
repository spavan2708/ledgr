"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuizQuestion } from "@/lib/tutor/types";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";

interface QuizEngineProps {
  quiz: QuizQuestion;
  lessonId: string;
  nextLessonId?: string;
}

export function QuizEngine({ quiz, lessonId, nextLessonId }: QuizEngineProps) {
  const router = useRouter();
  const { markLessonCompleted, submitQuizScore, session } = useFinSyncSession();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // If already completed in past session
  const alreadyCompleted = session?.tutor_completed_lessons?.includes(lessonId);

  const handleSubmit = () => {
    if (selectedIdx === null) return;
    setSubmitted(true);
    
    if (selectedIdx === quiz.correctAnswerIndex) {
      // Score 100 for correct, could be expanded later
      submitQuizScore(quiz.id, 100);
      markLessonCompleted(lessonId);
    }
  };

  const handleNext = () => {
    if (nextLessonId) {
      router.push(`/tutor/${nextLessonId}`);
    } else {
      router.push(`/tutor`);
    }
  };

  const isCorrect = selectedIdx === quiz.correctAnswerIndex;

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
      <h3 className="mb-4 text-xl font-bold text-white">Concept Check</h3>
      <p className="mb-6 text-slate-300">{quiz.question}</p>
      
      <div className="space-y-3">
        {quiz.options.map((option: string, idx: number) => {
          let stateClass = "border-white/10 bg-slate-900/50 hover:bg-white/10 text-slate-300";
          
          if (submitted) {
            if (idx === quiz.correctAnswerIndex) {
              stateClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
            } else if (idx === selectedIdx) {
              stateClass = "border-rose-500/50 bg-rose-500/10 text-rose-300";
            } else {
              stateClass = "border-white/5 bg-slate-900/20 text-slate-500 opacity-50";
            }
          } else if (selectedIdx === idx) {
            stateClass = "border-sky-500 bg-sky-500/20 text-sky-100";
          }

          return (
            <button
              key={idx}
              disabled={submitted || alreadyCompleted}
              onClick={() => setSelectedIdx(idx)}
              className={`w-full rounded-xl border p-4 text-left font-medium transition-all ${stateClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {!submitted && !alreadyCompleted && (
        <div className="mt-6 text-right">
          <button 
            disabled={selectedIdx === null} 
            onClick={handleSubmit} 
            className="primary-button disabled:opacity-50"
          >
            Submit Answer
          </button>
        </div>
      )}

      {(submitted || alreadyCompleted) && (
        <div className={`mt-6 rounded-xl border p-4 ${isCorrect || alreadyCompleted ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
          <h4 className={`font-bold ${isCorrect || alreadyCompleted ? "text-emerald-400" : "text-rose-400"}`}>
            {isCorrect || alreadyCompleted ? "Correct!" : "Incorrect"}
          </h4>
          <p className="mt-2 text-sm text-slate-300">{quiz.explanation}</p>
          
          {(isCorrect || alreadyCompleted) && (
            <div className="mt-4 text-right">
              <button onClick={handleNext} className="primary-button">
                {nextLessonId ? "Next Lesson →" : "Return to Curriculum"}
              </button>
            </div>
          )}
          {!isCorrect && !alreadyCompleted && (
            <div className="mt-4 text-right">
              <button onClick={() => { setSubmitted(false); setSelectedIdx(null); }} className="secondary-button">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
