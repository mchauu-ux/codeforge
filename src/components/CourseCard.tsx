import { Clock3, PlayCircle, Star, Users, Layers } from 'lucide-react';
import type { Course } from '../types';

const LEVEL_STYLES: Record<Course['level'], string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
};

const INSTRUCTOR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-violet-600',
];

function instructorColor(name: string) {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return INSTRUCTOR_COLORS[sum % INSTRUCTOR_COLORS.length];
}

interface CourseCardProps {
  course: Course;
  onOpen: (course: Course) => void;
  progress?: number;
}

export default function CourseCard({ course, onOpen, progress }: CourseCardProps) {
  const initials = course.instructor
    .split(' ')
    .map((p) => p[0])
    .join('');

  return (
    <article
      onClick={() => onOpen(course)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/60"
    >
      <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <span className="font-mono text-2xl font-bold text-white/20 transition-colors group-hover:text-white/35">
          {course.tag}
        </span>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/80 to-transparent px-3 pb-2 pt-6">
          <span className="flex items-center gap-1 text-xs font-medium text-amber-300">
            <Star size={12} className="fill-amber-300" />
            {course.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-300">
            <Users size={11} />
            {course.students >= 1000
              ? `${(course.students / 1000).toFixed(1)}k`
              : course.students}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${LEVEL_STYLES[course.level]}`}
          >
            {course.level}
          </span>
          {course.stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {tech}
            </span>
          ))}
        </div>

        <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-blue-700">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-600">
          {course.description}
        </p>

        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${instructorColor(course.instructor)}`}
          >
            {initials}
          </span>
          <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-600">
            {course.instructor}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-500">
            <Layers size={11} />
            {course.lessons}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-500">
            <Clock3 size={11} />
            {course.hours}h
          </span>
        </div>

        {typeof progress === 'number' && progress > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] font-medium text-slate-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-end">
          <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors group-hover:text-blue-700">
            <PlayCircle size={14} />
            {progress ? 'Continue' : 'View course'}
          </span>
        </div>
      </div>
    </article>
  );
}
