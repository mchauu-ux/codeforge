import { useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { COURSES } from '../../courses';
import CourseCard from '../CourseCard';
import type { Course, CourseLevel } from '../../types';
import { useEnrollment } from '../../context/EnrollmentContext';

const LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

interface CatalogProps {
  query: string;
  onOpenCourse: (course: Course) => void;
}

export default function Catalog({ query, onOpenCourse }: CatalogProps) {
  const [levelFilter, setLevelFilter] = useState<CourseLevel[]>([]);
  const [techFilter, setTechFilter] = useState<string[]>([]);
  const { enrollments, progressOf } = useEnrollment();

  const allTech = useMemo(() => {
    const set = new Map<string, number>();
    COURSES.forEach((c) => c.stack.forEach((t) => set.set(t, (set.get(t) ?? 0) + 1)));
    return [...set.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (levelFilter.length > 0 && !levelFilter.includes(c.level)) return false;
      if (techFilter.length > 0 && !c.stack.some((t) => techFilter.includes(t))) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.level.toLowerCase().includes(q) ||
        c.tag.includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.stack.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, levelFilter, techFilter]);

  const toggleLevel = (level: CourseLevel) =>
    setLevelFilter((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );

  const toggleTech = (tech: string) =>
    setTechFilter((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech],
    );

  const hasFilters = levelFilter.length > 0 || techFilter.length > 0;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Course Catalog</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} of {COURSES.length} courses
            {query.trim() ? ` matching "${query.trim()}"` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1">
          <SlidersHorizontal size={14} className="ml-1.5 text-slate-400" />
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                levelFilter.includes(level)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Tech stack
        </span>
        {allTech.map((tech) => (
          <button
            key={tech}
            onClick={() => toggleTech(tech)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              techFilter.includes(tech)
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            {tech}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={() => {
              setLevelFilter([]);
              setTechFilter([]);
            }}
            className="ml-2 flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-slate-700">No courses match</p>
          <p className="mt-1 text-sm text-slate-500">
            Try a different keyword or clear some filters.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onOpen={onOpenCourse}
              progress={
                enrollments[course.id]
                  ? progressOf(course.id, course.lessons)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
