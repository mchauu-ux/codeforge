import { useEffect, useState } from 'react';
import {
  X,
  Star,
  Users,
  Clock3,
  BookOpen,
  CheckCircle2,
  Circle,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';import type { Course } from '../types';
import { useEnrollment } from '../context/EnrollmentContext';

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

interface CourseDetailModalProps {
  course: Course;
  onClose: () => void;
}

export default function CourseDetailModal({ course, onClose }: CourseDetailModalProps) {
  const { enrollments, enroll, advance, progressOf } = useEnrollment();
  const [tab, setTab] = useState<'syllabus' | 'prerequisites'>('syllabus');
  const enrollment = enrollments[course.id];
  const progress = progressOf(course.id, course.lessons);


  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const initials = course.instructor
    .split(' ')
    .map((p) => p[0])
    .join('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 pb-5 pt-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-blue-200">
              {course.level}
            </span>
            {course.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-200"
              >
                {tech}
              </span>
            ))}
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">{course.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{course.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${instructorColor(course.instructor)}`}>
                {initials}
              </span>
              <span>
                <span className="font-semibold text-white">{course.instructor}</span>
                <span className="hidden sm:inline"> · {course.instructorTitle}</span>
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Users size={13} />
              {course.students.toLocaleString()} enrolled
            </span>
            <span className="flex items-center gap-1">
              <Clock3 size={13} />
              {course.hours} hrs
            </span>
          </div>
        </div>

        <div className="flex border-b border-slate-200 px-6">
          {(['syllabus', 'prerequisites'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
          <div className="ml-auto flex items-center text-xs text-slate-500">
            <BookOpen size={13} className="mr-1" />
            {course.lessons} lessons · {course.syllabus.length} weeks
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'syllabus' ? (
            <div className="space-y-0">
              {course.syllabus.map((week, idx) => (
                <div key={week.week} className="relative flex gap-4 pb-6 last:pb-0">
                  {idx < course.syllabus.length - 1 && (
                    <span className="absolute left-[15px] top-8 h-full w-px bg-slate-200" />
                  )}
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700">
                    {week.week}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="text-sm font-semibold text-slate-900">{week.title}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {week.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {course.prerequisites.map((prereq) => (
                <li key={prereq} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                  {prereq}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          {enrollment ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <GraduationCap size={14} />
                  Enrolled · {progress}% complete
                </span>
                <span>
                  {enrollment.lessonsDone}/{course.lessons} lessons
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button
                onClick={() => advance(course.id, course.lessons)}
                disabled={enrollment.lessonsDone >= course.lessons}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enrollment.lessonsDone >= course.lessons
                  ? 'Course complete'
                  : 'Continue to next lesson'}
                {enrollment.lessonsDone < course.lessons && <ArrowRight size={15} />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => enroll(course.id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Enroll / Start Learning
              <ArrowRight size={15} />
            </button>
          )}
          <p className="mt-2 flex items-center justify-center gap-1 text-center text-[11px] text-slate-400">
            <Circle size={8} className="fill-emerald-400 text-emerald-400" />
            Progress is tracked in this session
          </p>
        </div>
      </div>
    </div>
  );
}
