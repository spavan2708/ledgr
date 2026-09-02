"use client";

import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { TUTOR_CURRICULUM } from "@/lib/tutor/curriculum";

interface LessonControlsProps {
  lessonId: string;
  nextLessonId?: string;
  prevLessonId?: string;
  levelId: string;
}

export function LessonControls({ lessonId, nextLessonId, prevLessonId, levelId }: LessonControlsProps) {
  const router = useRouter();
  const { session, markLessonCompleted } = useFinSyncSession();
  
  const isCompleted = session?.tutor_completed_lessons?.includes(lessonId) || false;
  const allCompleted = session?.tutor_completed_lessons || [];

  const level = TUTOR_CURRICULUM.find(l => l.id === levelId);
  const totalLessons = level ? level.sections.reduce((acc, s) => acc + s.lessons.length, 0) : 0;
  const completedInLevel = level ? level.sections.reduce((acc, s) => acc + s.lessons.filter(l => allCompleted.includes(l.id)).length, 0) : 0;
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedInLevel / totalLessons) * 100);

  const handleComplete = () => {
    markLessonCompleted(lessonId);
    if (nextLessonId) {
      router.push(`/tutor/${nextLessonId}`);
    } else {
      router.push(`/tutor`);
    }
  };

  return (
    <div className="mt-12 space-y-8">
      {/* Progress Indicator */}
      {level && (
        <div className="border-t border-white/10 pt-8">
          <div className="flex justify-between text-sm font-medium text-slate-400 mb-2">
            <span>Level Progress: {level.title}</span>
            <span>{completedInLevel} / {totalLessons} Lessons ({progressPercent}%)</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>
      )}

      {/* Mark Complete Button */}
      <div className="flex justify-center border-t border-white/10 pt-8">
        {!isCompleted ? (
          <button 
            onClick={handleComplete}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <span className="text-xl"></span>
            Mark Lesson Complete
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 font-bold text-emerald-400">
            <span className="text-xl"></span>
            Lesson Completed
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-white/10 pt-8">
        <div>
          {prevLessonId ? (
            <Link 
              href={`/tutor/${prevLessonId}`}
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <span className="text-lg">←</span> Previous Lesson
            </Link>
          ) : (
            <span className="text-sm font-medium text-slate-600 cursor-not-allowed">
              <span className="text-lg">←</span> Previous Lesson
            </span>
          )}
        </div>
        
        <div>
          <Link 
            href="/tutor"
            className="text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-wider"
          >
            Back to {levelId}
          </Link>
        </div>

        <div className="text-right">
          {nextLessonId ? (
            <Link 
              href={`/tutor/${nextLessonId}`}
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Next Lesson <span className="text-lg">→</span>
            </Link>
          ) : (
            <Link 
              href={`/tutor`}
              className="flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Finish Level <span className="text-lg">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
