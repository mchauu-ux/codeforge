export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface SyllabusWeek {
  week: number;
  title: string;
  topics: string[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  level: CourseLevel;
  lessons: number;
  hours: number;
  tag: string;
  instructor: string;
  instructorTitle: string;
  rating: number;
  students: number;
  stack: string[];
  prerequisites: string[];
  syllabus: SyllabusWeek[];
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}
