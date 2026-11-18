import { useMemo, useState } from 'react';
import {
  Code2,
  Search,
  LogOut,
  Home as HomeIcon,
  LayoutDashboard,
  BookOpen,
  Layers,
  Award,
  HelpCircle,
  Settings,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { COURSES as COURSE_LIST } from '../courses';
import CourseCard from './CourseCard';
import Home from './views/Home';
import Dashboard from './views/Dashboard';
import Paths from './views/Paths';
import Help from './views/Help';

export type SectionId = 'home' | 'dashboard' | 'catalog' | 'paths' | 'certifications' | 'help' | 'settings';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;

interface LandingPageProps {
  query: string;
  onQueryChange: (q: string) => void;
  sessionEmail: string | null;
  onSignOut: () => void;
  onSignupClick: () => void;
  onSigninClick: () => void;
}

const NAV_ITEMS: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalog', label: 'Course Catalog', icon: BookOpen },
  { id: 'paths', label: 'Learning Paths', icon: Layers },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'help', label: 'Help Center', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function LandingPage({
  query,
  onQueryChange,
  sessionEmail,
  onSignOut,
  onSignupClick,
  onSigninClick,
}: LandingPageProps) {
  const [section, setSection] = useState<SectionId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSE_LIST.filter((c) => {
      if (levelFilter && c.level !== levelFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.level.toLowerCase().includes(q) ||
        c.tag.includes(q)
      );
    });
  }, [query, levelFilter]);

  const byLevel = useMemo(
    () => ({
      Beginner: filtered.filter((c) => c.level === 'Beginner'),
      Intermediate: filtered.filter((c) => c.level === 'Intermediate'),
      Advanced: filtered.filter((c) => c.level === 'Advanced'),
    }),
    [filtered],
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-800 bg-slate-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-950/50">
                <Code2 size={18} />
              </span>
              <span className="text-sm font-bold tracking-tight text-white">
                CodeForge<span className="text-indigo-400"> Academy</span>
              </span>
            </a>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 lg:hidden"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            <div className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Navigate
            </div>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = section === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setSection(id);
                    setSidebarOpen(false);
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-600/15 text-indigo-300'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-indigo-400 transition-all ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <Icon
                    size={17}
                    className={`transition-colors ${
                      active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  {label}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 p-3">
            {sessionEmail ? (
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-500">Signed in as</div>
                  <div className="truncate text-sm font-medium text-slate-200">{sessionEmail}</div>
                </div>
                <button
                  onClick={onSignOut}
                  className="flex w-full items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={onSignupClick}
                  className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-950/40 transition-opacity hover:opacity-90"
                >
                  Apply now
                </button>
                <button
                  onClick={onSigninClick}
                  className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  Student sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
              aria-label="Open menu"
            >
              <LayoutDashboard size={16} />
            </button>
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search courses…"
                aria-label="Search courses"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {section === 'home' && (
            <Home
              userName={sessionEmail?.split('@')[0] ?? null}
              query={query}
              onQueryChange={onQueryChange}
              onExploreCatalog={() => setSection('catalog')}
            />
          )}

          {section === 'dashboard' && (
            <Dashboard
              userName={sessionEmail?.split('@')[0] ?? null}
              onGoToCatalog={() => setSection('catalog')}
              onOpenCourse={() => {}}
            />
          )}

          {section === 'catalog' && (
            <section>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Course Catalog</h1>
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1">
                  <SlidersHorizontal size={14} className="ml-1.5 text-slate-400" />
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setLevelFilter((prev) => (prev === level ? null : level))}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        levelFilter === level
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
                  <p className="text-sm font-medium text-slate-700">No courses match</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try a different keyword or clear the level filter.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-10">
                  {LEVELS.map((level) =>
                    byLevel[level].length > 0 ? (
                      <div key={level}>
                        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                          {level} · {byLevel[level].length} course
                          {byLevel[level].length > 1 ? 's' : ''}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {byLevel[level].map((course) => (
                            <CourseCard key={course.id} course={course} />
                          ))}
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              )}
            </section>
          )}

          {section === 'paths' && <Paths query={query} onQueryChange={onQueryChange} />}

          {section === 'certifications' && (
            <section>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Certifications</h1>
              <p className="mt-2 text-sm text-slate-600">
                Proctored exams are offered at the end of each track. Passing earns a verified
                certificate recognized by our hiring partners.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { name: 'Certified Rust Systems Developer', level: 'Advanced' },
                  { name: 'Certified Distributed Systems Architect', level: 'Advanced' },
                  { name: 'Certified Full-Stack TypeScript Engineer', level: 'Intermediate' },
                  { name: 'Certified CS Foundations', level: 'Beginner' },
                ].map((cert) => (
                  <div
                    key={cert.name}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                      <Award size={20} className="text-amber-600" />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{cert.name}</div>
                      <div className="text-xs text-slate-500">{cert.level} level exam</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === 'help' && <Help />}

          {section === 'settings' && (
            <section className="max-w-2xl">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-slate-900">Account</div>
                {sessionEmail ? (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      Signed in as <span className="font-medium">{sessionEmail}</span>
                    </div>
                    <button
                      onClick={onSignOut}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">
                    Sign in to manage your account and notification preferences.
                  </p>
                )}
              </div>
            </section>
          )}
        </main>

        <footer className="border-t border-slate-200 bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 text-sm text-slate-500 sm:px-6">
            © {new Date().getFullYear()} CodeForge Academy. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
