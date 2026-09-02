"use client";

import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import { getLevelById } from "@/lib/tutor/curriculum";

export default function PdfGeneratorPage({ params }: { params: Promise<{ levelId: string }> }) {
  const resolvedParams = use(params);
  const levelId = resolvedParams.levelId.toUpperCase();
  const level = getLevelById(levelId);
  
  if (!level) notFound();

  useEffect(() => {
    // Automatically open the print dialog when the page loads
    // A slight delay ensures styles are applied
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white text-black min-h-screen p-8 print:p-0">
      {/* Hide navigation/header via CSS if needed, though this route shouldn't have the AppShell wrapping it in the same way, or we can use print-specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          aside, nav, header { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; max-width: none !important; }
          .page-break { page-break-before: always; }
        }
      `}} />

      <div className="no-print mb-8 p-4 bg-yellow-100 text-yellow-900 rounded-lg max-w-2xl mx-auto border border-yellow-300">
        <p className="font-bold">PDF Generation Mode</p>
        <p className="text-sm">Please wait for the print dialog to open, or press Ctrl+P / Cmd+P to save as PDF.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4">{level.title}</h1>
          <p className="text-xl text-gray-600">ledgr Tutor Mode — Level: {level.id}</p>
        </div>

        {level.sections.map((section, sIdx) => (
          <div key={section.id} className={sIdx > 0 ? "page-break mt-16" : ""}>
            <h2 className="text-3xl font-bold border-b-2 border-black pb-2 mb-8 uppercase">Section {sIdx + 1}: {section.title}</h2>
            
            {section.lessons.map((lesson, lIdx) => (
              <div key={lesson.id} className="mb-12">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{lIdx + 1}. {lesson.title}</h3>
                <p className="text-sm text-slate-500 italic mb-6">Objective: {lesson.learningObjective}</p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Core Concept</h4>
                    <p className="text-slate-800">{lesson.coreConcept}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Simple Explanation</h4>
                    <p className="text-slate-800">{lesson.simpleExplanation}</p>
                  </div>

                  {lesson.keyTerms && lesson.keyTerms.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Key Terms</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {lesson.keyTerms.map((term, i) => (
                          <li key={i}><strong className="text-slate-900">{term.term}:</strong> <span className="text-slate-700">{term.definition}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Real World Example</h4>
                    <p className="text-slate-700 italic border-l-4 border-slate-300 pl-4 py-1">{lesson.realWorldExample}</p>
                  </div>

                  {lesson.workedExample && (
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Worked Example</h4>
                      <pre className="bg-slate-100 p-4 rounded text-sm text-slate-800 whitespace-pre-wrap font-mono border border-slate-200">
                        {lesson.workedExample}
                      </pre>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Important Takeaways</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {lesson.importantTakeaways.map((takeaway, i) => (
                        <li key={i} className="text-slate-800">{takeaway}</li>
                      ))}
                    </ul>
                  </div>

                  {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
                    <div>
                      <h4 className="font-bold text-red-800 mb-2">Common Mistakes</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {lesson.commonMistakes.map((mistake, i) => (
                          <li key={i} className="text-red-900">{mistake}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
