import { notFound } from "next/navigation";
import { getLessonById, TUTOR_CURRICULUM } from "@/lib/tutor/curriculum";
import { PageHeader, Card } from "@/components/ui";
import { QuizEngine } from "@/components/tutor/QuizEngine";
import { TutorAIHelper } from "@/components/tutor/TutorAIHelper";
import { LessonControls } from "@/components/tutor/LessonControls";
import Link from "next/link";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const resolvedParams = await params;
  const lessonId = resolvedParams.lessonId;
  const lesson = getLessonById(lessonId);
  
  if (!lesson) {
    notFound();
  }

  let level = "BEGINNER";
  let nextLessonId: string | undefined;
  let prevLessonId: string | undefined;

  for (const lvl of TUTOR_CURRICULUM) {
    for (let sIdx = 0; sIdx < lvl.sections.length; sIdx++) {
      const section = lvl.sections[sIdx];
      const idx = section.lessons.findIndex(l => l.id === lessonId);
      
      if (idx !== -1) {
        level = lvl.id;
        
        // Find previous lesson
        if (idx > 0) {
          prevLessonId = section.lessons[idx - 1].id;
        } else if (sIdx > 0) {
          // previous section, last lesson
          if (lvl.sections[sIdx - 1].lessons.length > 0) {
            prevLessonId = lvl.sections[sIdx - 1].lessons[lvl.sections[sIdx - 1].lessons.length - 1].id;
          }
        }

        // Find next lesson
        if (idx + 1 < section.lessons.length) {
          nextLessonId = section.lessons[idx + 1].id;
        } else if (sIdx + 1 < lvl.sections.length) {
          // next section, first lesson
          if (lvl.sections[sIdx + 1].lessons.length > 0) {
            nextLessonId = lvl.sections[sIdx + 1].lessons[0].id;
          }
        }
        break;
      }
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/tutor" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <span className="text-lg">←</span> Back to Curriculum
      </Link>

      <PageHeader 
        title={lesson.title}
        description={`Level: ${level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()}`}
        action={<TutorAIHelper lessonTitle={lesson.title} concept={lesson.coreConcept} level={level} />}
      />

      <div className="space-y-6">
        <Card className="bg-slate-900 border-white/5">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Learning Objective</h2>
          <p className="text-slate-200 text-lg">{lesson.learningObjective}</p>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-start gap-4">
            <span className="text-2xl mt-1 shrink-0">🎯</span>
            <div>
              <h2 className="text-lg font-bold text-emerald-400 mb-2">Core Concept</h2>
              <p className="text-slate-200 leading-relaxed text-lg">{lesson.coreConcept}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-4">
            <span className="text-2xl mt-1 shrink-0">💡</span>
            <div>
              <h2 className="text-lg font-bold text-amber-400 mb-2">Simple Explanation</h2>
              <p className="text-slate-300 leading-relaxed">{lesson.simpleExplanation}</p>
            </div>
          </div>
        </Card>

        {lesson.keyTerms && lesson.keyTerms.length > 0 && (
          <Card>
            <h2 className="text-lg font-bold text-white mb-4">Key Terms</h2>
            <dl className="space-y-4">
              {lesson.keyTerms.map((term, i) => (
                <div key={i} className="border-l-2 border-slate-700 pl-4">
                  <dt className="font-bold text-sky-400">{term.term}</dt>
                  <dd className="text-slate-300 mt-1">{term.definition}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}

        <Card>
          <h2 className="text-lg font-bold text-sky-400 mb-2">Real World Example</h2>
          <p className="text-slate-300 leading-relaxed italic border-l-2 border-sky-400/50 pl-4 py-1">
            "{lesson.realWorldExample}"
          </p>
        </Card>

        {lesson.workedExample && (
          <Card className="bg-slate-900/50">
            <h2 className="text-lg font-bold text-white mb-4">Worked Example</h2>
            <div className="text-slate-300 whitespace-pre-wrap font-mono text-sm bg-slate-950 p-4 rounded-xl border border-white/5">
              {lesson.workedExample}
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <h2 className="text-lg font-bold text-emerald-400 mb-4">Important Takeaways</h2>
            <ul className="space-y-2">
              {lesson.importantTakeaways.map((takeaway, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </Card>

          {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
            <Card className="bg-rose-500/5 border-rose-500/20">
              <h2 className="text-lg font-bold text-rose-400 mb-4">Common Mistakes</h2>
              <ul className="space-y-2">
                {lesson.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <span className="text-rose-500 mt-0.5">✕</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <QuizEngine 
          quiz={lesson.quiz} 
          lessonId={lesson.id} 
          nextLessonId={nextLessonId} 
        />

        <LessonControls 
          lessonId={lesson.id} 
          nextLessonId={nextLessonId} 
          prevLessonId={prevLessonId}
          levelId={level}
        />
      </div>
    </div>
  );
}
