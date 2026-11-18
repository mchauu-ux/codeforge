import { Search, ArrowRight, FlaskConical, Radio, GraduationCap } from 'lucide-react';
import type React from 'react';

interface HomeProps {
  userName: string | null;
  query: string;
  onQueryChange: (q: string) => void;
  onExploreCatalog: () => void;
}

const TICKER_ITEMS = [
  '12,400+ active students',
  '8 elite engineering courses',
  '94% cohort completion rate',
  '4 career-defining learning paths',
  '40+ industry mentors',
  '120+ live sessions per year',
  '4.8/5 average course rating',
];

const VALUE_PROPS = [
  {
    icon: FlaskConical,
    title: 'Hands-On Labs',
    description:
      'Every course is built around real projects — write an allocator, ship a compiler, tune a query planner. You graduate with a portfolio, not just notes.',
    accent: 'from-indigo-500 to-blue-600',
  },
  {
    icon: Radio,
    title: 'Real-Time Collaboration',
    description:
      'Pair in live sessions, get unblocked in cohort channels, and defend your capstone in front of faculty and peers — all inside the platform.',
    accent: 'from-blue-500 to-cyan-600',
  },
  {
    icon: GraduationCap,
    title: 'Elite Curriculum Standards',
    description:
      'Taught by engineers from Amazon, Mozilla, and CockroachDB. Rigorous, current, and brutally practical — no filler content, ever.',
    accent: 'from-violet-500 to-indigo-600',
  },
];

export default function Home({
  userName,
  query,
  onQueryChange,
  onExploreCatalog,
}: HomeProps) {
  const firstName = userName?.trim().length ? userName[0].toUpperCase() + userName.slice(1) : null;

  const handleHeroKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      onExploreCatalog();
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-950 px-6 py-12 sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#818cf8_1px,transparent_1px),linear-gradient(to_bottom,#818cf8_1px,transparent_1px)] [background-size:44px_44px]" />
        </div>

        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
            {firstName ? `Welcome back, ${firstName}` : 'Cohort applications open'}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Master Modern Engineering{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              &amp; Systems Architecture
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Deep, rigorous training in systems programming, distributed infrastructure, and
            computer science fundamentals — taught by practitioners who ship for a living.
          </p>

          <div className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={handleHeroKeyDown}
                placeholder="What do you want to master?"
                aria-label="Quick search"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none backdrop-blur transition-all placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <button
              onClick={onExploreCatalog}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition-all hover:opacity-90"
            >
              Explore Catalog
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Stats ticker */}
      <section
        aria-label="Academy statistics"
        className="relative overflow-hidden rounded-xl border border-slate-200 bg-white py-3"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
        <div className="flex w-max animate-ticker gap-0">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {TICKER_ITEMS.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center gap-2 whitespace-nowrap px-6 text-sm font-medium text-slate-600"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Why CodeForge Academy
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Built by engineers, for engineers. Three principles set the academy apart.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {VALUE_PROPS.map((prop) => (
            <article
              key={prop.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/70"
            >
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${prop.accent} text-white shadow-md`}
              >
                <prop.icon size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{prop.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{prop.description}</p>
              <div
                className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${prop.accent} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
              />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
