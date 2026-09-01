"use client";

import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { TUTOR_CURRICULUM } from "@/lib/tutor/curriculum";
import { PageHeader, Card, Badge } from "@/components/ui";
import Link from "next/link";
import type { TutorLevelId } from "@/lib/tutor/types";

export default function TutorHome() {
  const { session } = useFinSyncSession();
  const completed = session?.tutor_completed_lessons || [];
  const scores = session?.tutor_assessment_scores || {};
  
  // Calculate total progress
  const totalLessons = TUTOR_CURRICULUM.reduce((acc, lvl) => 
    acc + lvl.sections.reduce((sAcc, sec) => sAcc + sec.lessons.length, 0), 0);
  const totalCompleted = completed.length;
  const overallPercent = totalLessons === 0 ? 0 : Math.round((totalCompleted / totalLessons) * 100);

  // Check unlocks
  const isBeginnerPassed = (scores["BEGINNER"] ?? 0) >= 7;
  const isModeratePassed = (scores["MODERATE"] ?? 0) >= 7;
  const isAdvancedPassed = (scores["ADVANCED"] ?? 0) >= 7;

  const isUnlocked = (levelId: TutorLevelId) => {
    if (levelId === "BEGINNER") return true;
    if (levelId === "MODERATE") return isBeginnerPassed;
    if (levelId === "ADVANCED") return isModeratePassed;
    return false;
  };

  const isLevelCompleted = (levelId: TutorLevelId) => {
    if (levelId === "BEGINNER") return isBeginnerPassed;
    if (levelId === "MODERATE") return isModeratePassed;
    if (levelId === "ADVANCED") return isAdvancedPassed;
    return false;
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">FINANCE TUTOR</h1>
        <p className="mt-4 text-xl text-slate-300 max-w-2xl">
          Learn money. Understand investing. Build the confidence to become financially independent.
        </p>
        <p className="mt-2 text-sm font-semibold text-emerald-400">— Team Octane</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
        <h2 className="text-lg font-bold text-white mb-2">OVERALL PROGRESS</h2>
        <div className="flex items-center gap-4">
          <div className="h-4 flex-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${overallPercent}%` }} />
          </div>
          <span className="font-mono font-bold text-emerald-400">{overallPercent}%</span>
        </div>
      </div>

      <div className="space-y-16">
        {TUTOR_CURRICULUM.map((level) => {
          const lvlLessons = level.sections.reduce((acc, s) => acc + s.lessons.length, 0);
          const lvlCompleted = level.sections.reduce((acc, s) => acc + s.lessons.filter(l => completed.includes(l.id)).length, 0);
          const canTakeAssessment = lvlCompleted === lvlLessons && lvlLessons > 0;
          const unlocked = isUnlocked(level.id);
          const passed = isLevelCompleted(level.id);
          const score = scores[level.id];

          return (
            <section key={level.id} className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white uppercase">{level.id}</h2>
                    {passed && <Badge tone="success">Passed</Badge>}
                    {!unlocked && <Badge tone="neutral">🔒 Locked</Badge>}
                  </div>
                  <h3 className="text-xl font-medium text-emerald-400">{level.title}</h3>
                  <p className="text-slate-400 mt-1 max-w-2xl">{level.description}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link 
                    href={`/tutor/pdf/${level.id}`} 
                    target="_blank"
                    className="secondary-button text-xs !px-3 !py-1.5 whitespace-nowrap"
                  >
                    📄 Download Notes
                  </Link>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-300">
                      {lvlCompleted} / {lvlLessons} Lessons
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {level.sections.map(section => (
                  <Card key={section.id} className="flex flex-col">
                    <h4 className="text-lg font-bold text-white mb-1">{section.title}</h4>
                    <p className="text-xs text-slate-400 mb-4">{section.description}</p>
                    
                    <ul className="mt-auto flex-1 space-y-3 border-t border-white/5 pt-4">
                      {section.lessons.map(lesson => {
                        const isDone = completed.includes(lesson.id);
                        return (
                          <li key={lesson.id} className="block w-full">
                            <Link 
                              href={`/tutor/${lesson.id}`} 
                              className={`flex items-center w-full gap-3 rounded-lg p-3 transition-colors ${unlocked ? 'cursor-pointer hover:bg-white/10' : 'pointer-events-none opacity-50'} ${isDone ? 'text-emerald-400' : 'text-slate-300'}`}
                            >
                              <span className={`text-lg leading-none shrink-0 ${isDone ? '' : 'text-slate-500'}`}>
                                {isDone ? '✓' : '▶'}
                              </span>
                              <span className="text-sm font-medium leading-tight">{lesson.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                ))}
              </div>

              {level.videos && level.videos.length > 0 && (
                <div className="mt-12 space-y-4">
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">
                    Learn Through Videos
                  </h3>
                  <p className="text-slate-400 text-sm">
                    <span className="text-xl mr-2">🎥</span>
                    Recommended videos to reinforce what you learned in this level.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {level.videos.map((video, vIdx) => (
                      <Card key={vIdx} className="bg-slate-900 border-white/5 p-5 flex flex-col hover:bg-slate-800 transition-colors">
                        <h4 className="text-white font-bold mb-2 leading-tight">{video.title}</h4>
                        <p className="text-xs text-slate-400 mb-4 flex-1 line-clamp-3">{video.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                          <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">{video.provider}</span>
                          <a 
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                          >
                            Watch Video <span className="text-sm">→</span>
                          </a>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 flex items-center justify-between rounded-xl bg-slate-900 border border-white/10 p-6">
                <div>
                  <h4 className="text-lg font-bold text-white">Level Assessment</h4>
                  <p className="text-sm text-slate-400 mt-1">
                    {passed 
                      ? `You passed this level with a score of ${score}/10.` 
                      : !unlocked
                        ? `🔒 Complete ${level.id === "MODERATE" ? "Beginner" : "Moderate"} to unlock the ${level.id} assessment.`
                        : canTakeAssessment 
                          ? "You've completed all lessons! Take the assessment to unlock the next level." 
                          : "Complete all lessons to unlock the assessment."}
                  </p>
                </div>
                <Link 
                  href={`/tutor/assessment/${level.id}`}
                  className={`primary-button whitespace-nowrap ${(canTakeAssessment || passed) ? '' : 'opacity-50 pointer-events-none'}`}
                >
                  {passed ? "Retake Assessment" : "Start Assessment"}
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
