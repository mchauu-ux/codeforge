import { Flame, CalendarDays, Video, ArrowRight } from 'lucide-react';
import { COURSES } from '../../courses';
import { useEnrollment } from '../../context/EnrollmentContext';
import type { Course } from '../../types';

interface DashboardProps {
  userName: string | null;
  onOpenCourse: (course: Course) => void;
  onGoToCatalog: () => void;
}

const WORKSHOPS = [
  {
    title: 'Live Q&A: Designing for Failure',
    host: 'Priya Raghavan',
    when: 'Tue · 18:00 UTC',
    tag: 'Distributed Systems',
    live: true,
  },
  {
    title: 'Workshop: Writing a Tiny Regex Engine',
    host: 'Elena Vasquez',
    when: 'Thu · 16:00 UTC',
    tag: 'Compilers',
    live: false,
  },
  {
    title: 'Office Hours: Query Plans Demystified',
    host: 'Amina Diallo',
    when: 'Fri · 15:00 UTC',
    tag: 'Databases',
    live: false,
  },
  {
    title: 'Live Q&A: Passkeys & the Passwordless Future',
    host: 'Yusuf Karim',
    when: 'Mon · 17:00 UTC',
    tag: 'Security',
    live: true,
  },
];

export default function Dashboard({ userName, onOpenCourse, onGoToCatalog }: DashboardProps) {
  const { enrollments, progressOf } = useEnrollment();

  const rows = Object.values(enrollments).map((e) => ({
    enrollment: e,
    course: COURSES.find((c) => c.id === e.courseId),
  }));

  const active = rows.filter((r) => r.course && r.enrollment.lessonsDone < r.course.lessons);
  const completed = rows.filter((r) => r.course && r.enrollment.lessonsDone >= r.course.lessons);
  const completedHours = rows.reduce((sum, r) => {
    if (!r.course) return sum;
    return sum + Math.round((r.enrollment.lessonsDone / r.course.lessons) * r.course.hours);
  }, 0);

  const firstName = userName?.trim().length ? userName[0].toUpperCase() + userName.slice(1) : null;

  return (
    <div className="space-y-8">
      {/* Welcome banner with stats */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {firstName ? `Welcome back, ${firstName}` : 'Welcome to CodeForge'}
        </h1>
        <p className="mt-1.5 text-sm text-slate-300">
          Your engineering progress at a glance. Keep the streak alive.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Active Courses', value: String(active.length) },
            { label: 'Completed Hours', value: String(completedHours) },
            { label: 'Study Streak', value: '6 days', flame: true },
            { label: 'Certifications', value: String(completed.length) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {stat.flame && <Flame size={13} className="text-amber-400" />}
                {stat.label}
              </div>
              <div className="mt-1.5 text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Continue Learning */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Continue Learning</h2>
          {active.length === 0 && (
            <button
              onClick={onGoToCatalog}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Browse catalog
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {active.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-700">No active courses yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Enroll in a course from the catalog and your progress will appear here.
            </p>
            <button
              onClick={onGoToCatalog}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Explore the catalog
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map(({ enrollment, course }) => {
              if (!course) return null;
              const progress = progressOf(course.id, course.lessons);
              return (
                <button
                  key={course.id}
                  onClick={() => onOpenCourse(course)}
                  className="group rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                      {course.level}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{progress}%</span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-bold text-slate-900 group-hover:text-blue-700">
                    {course.title}
                  </h3>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                    <span>
                      {enrollment.lessonsDone}/{course.lessons} lessons
                    </span>
                    <span className="font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Resume
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Workshops / Live Q&A schedule */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Upcoming Workshops &amp; Live Q&amp;A
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {WORKSHOPS.map((w, idx) => (
            <div
              key={w.title}
              className={`flex flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50 ${
                idx > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                {w.live ? <Video size={16} /> : <CalendarDays size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900">{w.title}</span>
                  {w.live && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                      Live
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">Hosted by {w.host}</div>
              </div>
              <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 sm:block">
                {w.tag}
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-slate-600">
                <CalendarDays size={12} />
                {w.when}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
