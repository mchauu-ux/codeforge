import { useMemo, useState } from 'react';
import { Layers, BookOpen, Clock3, X } from 'lucide-react';
import { LEARNING_PATHS, type LearningPath } from '../../learningPaths';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const PAGE_SIZE = 12;

const LEVEL_STYLES: Record<LearningPath['level'], string> = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
};

interface PathsProps {
  query: string;
  onQueryChange: (q: string) => void;
}

export default function Paths({ query, onQueryChange }: PathsProps) {
  const [levelFilter, setLevelFilter] = useState<LearningPath['level'] | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LEARNING_PATHS.filter((p) => {
      if (levelFilter && p.level !== levelFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.level.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
      );
    });
  }, [query, levelFilter]);

  const shown = filtered.slice(0, visible);

  const pickLevel = (level: LearningPath['level']) => {
    setLevelFilter((prev) => (prev === level ? null : level));
    setVisible(PAGE_SIZE);
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Learning Paths</h1>
          <p className="mt-1 text-sm text-slate-600">
            {LEARNING_PATHS.length} curated course sequences — from first principles to job-ready
            depth.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1">
          <Layers size={14} className="ml-1.5 text-slate-400" />
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => pickLevel(level)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                levelFilter === level
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {query.trim() && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
          Searching for “{query.trim()}”
          <button onClick={() => onQueryChange('')} aria-label="Clear search">
            <X size={13} />
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-slate-700">No paths match</p>
          <p className="mt-1 text-sm text-slate-500">
            Try a different keyword or clear the level filter.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((path) => (
              <article
                key={path.title}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${LEVEL_STYLES[path.level]}`}
                  >
                    {path.level}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {path.courses} courses
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                  {path.title}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {path.courses}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={12} />
                    {path.hours}h
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                  {path.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {visible < filtered.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700"
              >
                Load more paths ({filtered.length - visible} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
