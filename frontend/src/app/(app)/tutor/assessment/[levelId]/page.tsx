"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { getLevelById } from "@/lib/tutor/curriculum";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { PageHeader, Card } from "@/components/ui";
import Link from "next/link";

export default function AssessmentPage({ params }: { params: Promise<{ levelId: string }> }) {
  const resolvedParams = use(params);
  const levelId = resolvedParams.levelId.toUpperCase();
  const level = getLevelById(levelId);
  
  if (!level) notFound();

  const router = useRouter();
  const { submitAssessmentScore } = useFinSyncSession();
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  // Track score
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = level.assessment;
  if (!questions || questions.length !== 10) {
    return <div className="p-8 text-white">Assessment data error.</div>;
  }

  const currentQ = questions[currentIdx];
  const isCorrect = selectedIdx === currentQ.correctAnswerIndex;

  const handleSubmit = () => {
    if (selectedIdx === null) return;
    setSubmitted(true);
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(i => i + 1);
      setSelectedIdx(null);
      setSubmitted(false);
    } else {
      // Finished all 10
      submitAssessmentScore(level.id, score);
      setFinished(true);
    }
  };

  const handleRetake = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setSubmitted(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const passed = score >= 7;
    return (
      <div className="max-w-2xl mx-auto mt-12 space-y-8 text-center">
        <h1 className="text-4xl font-bold text-white uppercase">{level.id} ASSESSMENT COMPLETE</h1>
        <div className="py-8">
          <div className="text-6xl font-extrabold mb-4 text-white">{score} / 10</div>
          <div className="text-2xl font-medium text-slate-300">{score * 10}%</div>
        </div>
        
        <div className={`p-6 rounded-2xl border ${passed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
          <h2 className={`text-2xl font-bold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
            {passed ? "Level Passed! " : "Did Not Pass"}
          </h2>
          <p className="mt-2 text-slate-300">
            {passed 
              ? "Congratulations! You have demonstrated a solid understanding of these concepts and unlocked the next level."
              : "You need a score of 70% or higher to pass. Review the lessons and try again when you're ready."}
          </p>
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <Link href="/tutor" className="secondary-button">Return to Curriculum</Link>
          <button onClick={handleRetake} className="primary-button">
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/tutor" className="text-sm text-slate-400 hover:text-white transition-colors">
          <span className="text-lg">←</span> Exit Assessment
        </Link>
        <div className="text-sm font-bold text-slate-300 uppercase tracking-widest">
          {level.id}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-slate-400 mb-1">
          <span>Question {currentIdx + 1} of 10</span>
          <span>{Math.round((currentIdx / 10) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-sky-500 transition-all" style={{ width: `${(currentIdx / 10) * 100}%` }} />
        </div>
      </div>

      <Card className="p-8">
        <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">{currentQ.question}</h2>
        
        <div className="space-y-4">
          {currentQ.options.map((opt, idx) => {
            let stateClass = "border-white/10 bg-slate-900/50 hover:bg-white/10 text-slate-300";
            if (submitted) {
              if (idx === currentQ.correctAnswerIndex) {
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
                disabled={submitted}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full rounded-xl border p-4 text-left font-medium transition-all ${stateClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {!submitted && (
          <div className="mt-8 text-right">
            <button 
              disabled={selectedIdx === null} 
              onClick={handleSubmit} 
              className="primary-button disabled:opacity-50"
            >
              Submit Answer
            </button>
          </div>
        )}

        {submitted && (
          <div className={`mt-8 rounded-xl border p-6 ${isCorrect ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
            <h4 className={`text-lg font-bold ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </h4>
            <p className="mt-3 text-slate-300 leading-relaxed">{currentQ.explanation}</p>
            
            <div className="mt-6 text-right">
              <button onClick={handleNext} className="primary-button">
                {currentIdx + 1 === 10 ? "Finish Assessment" : "Next Question →"}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
