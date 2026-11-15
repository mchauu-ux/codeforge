import { ArrowRight, DollarSign, TrendingUp } from 'lucide-react';
import { LEARNING_PATHS } from '../../paths';
import { COURSES } from '../../courses';
import type { Course } from '../../types';

interface PathsProps {
  onOpenCourse: (course: Course) => void;
}

const DEMAND_STYLES: Record<string, string> = {
  High: 'bg-slate-100 text-slate-600',
  'Very high': 'bg-amber-100 text-amber-700',
  Explosive: 'bg-rose-100 text-rose-700',
};

export default function Paths({ onOpenCourse }: PathsProps) {
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Learning Paths</h1>
      <p className="mt-1 text-sm text-slate-500">
        Structured career tracks — complete each milestone in order for maximum depth.
      </p>

      <div className="mt-6 space-y-6">
        {LEARNING_PATHS.map((path) => {
          const totalHours = path.milestones.reduce((sum, m) => {
            const course = m.courseId ? COURSES.find((c) => c.id === m.courseId) : null;
            return sum + (course?.hours ?? 0);
          }, 0);

          return (
            <div
              key={path.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">{path.name}</h2>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${DEMAND_STYLES[path.demand]}`}
                  >
                    <TrendingUp size={11} />
                    {path.demand} demand
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <DollarSign size={11} />
                    {path.salary}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">{path.tagline}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {path.milestones.length} milestones · ≈{totalHours} course hours
                </p>
              </div>

              <div className="px-6 py-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  {path.milestones.map((milestone, idx) => {
                    const course = milestone.courseId
                      ? COURSES.find((c) => c.id === milestone.courseId)
                      : null;
                    const isLast = idx === path.milestones.length - 1;

                    return (
                      <div key={milestone.title} className="relative flex sm:flex-col">
                        <div className="flex flex-col items-center sm:mb-3 sm:flex-row">
                          <span
                            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                              isLast
                                ? 'bg-gradient-to-br from-amber-500 to-rose-500'
                                : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                            }`}
                          >
                            {isLast ? '★' : idx + 1}
                          </span>
                          {!isLast && (
                            <>
                              <span className="absolute left-8 top-4 h-px w-full bg-slate-200 sm:hidden" />
                              <span className="mt-1 hidden h-px w-full bg-slate-200 sm:mt-0 sm:block" />
                            </>
                          )}
                        </div>

                        {course ? (
                          <button
                            onClick={() => onOpenCourse(course)}
                            className="group ml-4 min-w-0 flex-1 text-left sm:ml-0"
                          >
                            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                              {milestone.title}
                            </div>
                            <div className="mt-0.5 text-xs leading-relaxed text-slate-500">
                              {milestone.detail}
                            </div>
                            <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                              View syllabus
                              <ArrowRight size={11} />
                            </div>
                          </button>
                        ) : (
                          <div className="ml-4 min-w-0 flex-1 sm:ml-0">
                            <div className="text-sm font-semibold text-slate-900">
                              {milestone.title}
                            </div>
                            <div className="mt-0.5 text-xs leading-relaxed text-slate-500">
                              {milestone.detail}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
