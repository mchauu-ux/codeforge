import { BookOpen, Clock3, PlayCircle } from 'lucide-react';
import type { Course } from '../types';

const LEVEL_STYLES: Record<Course['level'], string> = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
};

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <span className="font-mono text-xl font-bold text-white/25 transition-colors group-hover:text-white/40">
          {course.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_STYLES[course.level]}`}
          >
            {course.level}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {course.tag}
          </span>
        </div>

        <h3 className="text-sm font-bold text-slate-900">{course.title}</h3>
        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-600">
          {course.description}
        </p>

        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            {course.lessons}
          </span>
          <span className="flex items-center gap-1">
            <Clock3 size={12} />
            {course.hours}h
          </span>
          <button className="ml-auto flex items-center gap-1 font-medium text-blue-600 transition-colors hover:text-blue-700">
            <PlayCircle size={13} />
            Start
          </button>
        </div>
      </div>
    </article>
  );
}
