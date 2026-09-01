import type { TutorLevel } from "./types";
import { beginnerLevel } from "./data/beginner";
import { moderateLevel } from "./data/moderate";
import { advancedLevel } from "./data/advanced";

export const TUTOR_CURRICULUM: TutorLevel[] = [
  beginnerLevel,
  moderateLevel,
  advancedLevel
];

export function getLessonById(id: string) {
  for (const level of TUTOR_CURRICULUM) {
    for (const section of level.sections) {
      const lesson = section.lessons.find((l) => l.id === id);
      if (lesson) return lesson;
    }
  }
  return null;
}

export function getSectionById(id: string) {
  for (const level of TUTOR_CURRICULUM) {
    const section = level.sections.find((s) => s.id === id);
    if (section) return section;
  }
  return null;
}

export function getLevelById(id: string) {
  return TUTOR_CURRICULUM.find((l) => l.id === id) || null;
}
