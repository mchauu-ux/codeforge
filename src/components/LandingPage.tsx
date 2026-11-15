import { useMemo, useState } from 'react';
import {
  Search,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Layers,
  Award,
  HelpCircle,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useEnrollment } from '../context/EnrollmentContext';
import Dashboard from './views/Dashboard';
import Catalog from './views/Catalog';
import Paths from './views/Paths';
import Certifications from './views/Certifications';
import CourseDetailModal from './CourseDetailModal';
import type { Course } from '../types';

export type SectionId =
  | 'dashboard'
  | 'catalog'
  | 'paths'
  | 'certifications'
  | 'help'
  | 'settings';

const NAV_ITEMS: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalog', label: 'Course Catalog', icon: BookOpen },
  { id: 'paths', label: 'Learning Paths', icon: Layers },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'help', label: 'Help Center', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const HELP_ITEMS = [
  {
    q: 'How do enrollments work?',
    a: 'Open any course in the catalog, review the syllabus, and press "Enroll / Start Learning". Progress is tracked instantly and appears on your dashboard.',
  },
  {
    q: 'How do certifications get issued?',
    a: 'Each track ends with a proctored exam. Passing earns a credential with a cryptographic hash entered into the public verification registry.',
  },
  {
    q: 'Can I switch tracks mid-cohort?',
    a: 'Yes — during the first two weeks of any cohort, from your account settings.',
  },
  {
    q: 'Are courses self-paced?',
    a: 'Core content is self-paced; cohort critiques, live Q&As, and certification exams run on a published schedule.',
  },
  {
    q: 'Is there a student community?',
    a: 'Yes — accepted students get access to private discussion channels and study groups for their cohort.',
  },
];

interface LandingPageProps {
  query: string;
  onQueryChange: (q: string) => void;
  sessionEmail: string | null;
  onSignOut: () => void;
  onSignupClick: () => void;
  onSigninClick: () => void;
}

export default function LandingPage({
  query,
  onQueryChange,
  sessionEmail,
  onSignOut,
  onSignupClick,
  onSigninClick,
}: LandingPageProps) {
  const [section, setSection] = useState<SectionId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCourse, setOpenCourse] = useState<Course | null>(null);
  const { enrollments } = useEnrollment();

  const goTo = (id: SectionId) => {
    setSection(id);
    setSidebarOpen(false);
  };

  const content = useMemo(() => {
    switch (section) {
      case 'dashboard':
        return (
          <Dashboard
            userName={sessionEmail?.split('@')[0] ?? null}
            onOpenCourse={setOpenCourse}
            onGoToCatalog={() => goTo('catalog')}
          />
        );
      case 'catalog':
        return <Catalog query={query} onOpenCourse={setOpenCourse} />;
      case 'paths':
        return <Paths onOpenCourse={setOpenCourse} />;
      case 'certifications':
        return <Certifications />;
      default:
        return null;
    }
  }, [section, query, sessionEmail]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm">
                <Code2 size={18} />
              </span>
              <span className="text-sm font-bold tracking-tight text-slate-900">
                CodeForge<span className="text-blue-600"> Academy</span>
              </span>
            </a>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  section === id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={17} />
                {label}
                <ChevronRight
                  size={14}
                  className={`ml-auto transition-opacity ${
                    section === id ? 'opacity-70' : 'opacity-0'
                  }`}
                />
              </button>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-3">
            {sessionEmail ? (
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-400">Signed in as</div>
                  <div className="truncate text-sm font-medium text-slate-800">{sessionEmail}</div>
                </div>
                <button
                  onClick={onSignOut}
                  className="flex w-full items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={onSignupClick}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  Apply now
                </button>
                <button
                  onClick={onSigninClick}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
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
              <Menu size={16} />
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
                placeholder="Search courses, topics, instructors…"
                aria-label="Search courses"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            {sessionEmail && (
              <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {Object.keys(enrollments).length} active
              </span>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {content}

          {section === 'help' && (
            <section className="max-w-2xl">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Help Center</h1>
              <div className="mt-6 space-y-3">
                {HELP_ITEMS.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900">
                      {item.q}
                      <ChevronRight
                        size={16}
                        className="text-slate-400 transition-transform group-open:rotate-90"
                      />
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

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

      {openCourse && (
        <CourseDetailModal course={openCourse} onClose={() => setOpenCourse(null)} />
      )}
    </div>
  );
}
