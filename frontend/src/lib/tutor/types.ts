export type TutorLevelId = "BEGINNER" | "MODERATE" | "ADVANCED";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface VideoResource {
  title: string;
  provider: string;
  url: string;
  description: string;
  duration?: string;
}

export interface TutorLesson {
  id: string;
  title: string;
  learningObjective: string;
  coreConcept: string;
  simpleExplanation: string;
  keyTerms?: { term: string; definition: string }[];
  realWorldExample: string;
  workedExample?: string;
  importantTakeaways: string[];
  commonMistakes?: string[];
  quiz: QuizQuestion;
}

export interface TutorSection {
  id: string;
  title: string;
  description: string;
  lessons: TutorLesson[];
  videos?: VideoResource[];
}

export interface TutorLevel {
  id: TutorLevelId;
  title: string;
  description: string;
  sections: TutorSection[];
  videos?: VideoResource[];
  assessment: QuizQuestion[]; // Exactly 10 questions
}
