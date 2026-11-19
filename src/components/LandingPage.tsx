import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Clock3,
  FileText,
  ListChecks,
  PlayCircle,
  Target,
  ArrowUpRight,
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  Flame,
  GraduationCap,
  HelpCircle,
  Home as HomeIcon,
  LayoutDashboard,
  Layers,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  Database,
  Globe,
  Cpu,
  Cloud,
  GitBranch,
  Smartphone,
  Star,
  X,
  Zap,
} from 'lucide-react';

import { COURSES as COURSE_LIST } from '../courses';
import Home from './views/Home';
import Dashboard from './views/Dashboard';
import Paths from './views/Paths';
import Help from './views/Help';

export type SectionId =
  | 'home'
  | 'dashboard'
  | 'catalog'
  | 'paths'
  | 'certifications'
  | 'help'
  | 'settings';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;


// Additional catalogue entries. These are sample courses for the front-end library;
// connect them to the course database/API when the real course content is ready.
const EXTRA_COURSES = [
  { id: 'cf-python-fundamentals', title: 'Python Programming Fundamentals', description: 'Learn variables, data types, conditions, loops, functions, and the basic habits used to write readable Python programs.', level: 'Beginner', tag: 'Python' },
  { id: 'cf-python-oop', title: 'Object-Oriented Python', description: 'Organize larger Python programs with classes, objects, inheritance, composition, and practical design exercises.', level: 'Intermediate', tag: 'Python, OOP' },
  { id: 'cf-javascript', title: 'JavaScript Essentials', description: 'Understand modern JavaScript, the DOM, events, asynchronous code, and the language features behind interactive websites.', level: 'Beginner', tag: 'JavaScript, Web' },
  { id: 'cf-html-css', title: 'HTML & CSS: Build Your First Website', description: 'Create structured pages and responsive layouts using semantic HTML, CSS fundamentals, Flexbox, and Grid.', level: 'Beginner', tag: 'HTML, CSS, Web Design' },
  { id: 'cf-react', title: 'React Interface Development', description: 'Build component-based interfaces with JSX, props, state, hooks, reusable patterns, and practical page composition.', level: 'Intermediate', tag: 'React, JavaScript, Frontend' },
  { id: 'cf-typescript', title: 'TypeScript for JavaScript Developers', description: 'Add dependable types to JavaScript projects with interfaces, unions, generics, narrowing, and typed component patterns.', level: 'Intermediate', tag: 'TypeScript, JavaScript' },
  { id: 'cf-node', title: 'Node.js Backend Foundations', description: 'Explore server-side JavaScript, modules, asynchronous workflows, routing, and the foundations of backend services.', level: 'Intermediate', tag: 'Node.js, Backend' },
  { id: 'cf-api-design', title: 'REST API Design & Development', description: 'Learn resource modeling, HTTP methods, status codes, validation, API documentation, and maintainable endpoint design.', level: 'Intermediate', tag: 'API, Backend, HTTP' },
  { id: 'cf-sql', title: 'SQL and Relational Databases', description: 'Query relational data, connect tables, design schemas, and understand constraints, indexes, and normalization.', level: 'Beginner', tag: 'SQL, Database' },
  { id: 'cf-algorithms', title: 'Algorithms & Complexity', description: 'Practice searching, sorting, recursion, problem decomposition, and reasoning about time and space complexity.', level: 'Intermediate', tag: 'Algorithms, Computer Science' },
  { id: 'cf-data-structures', title: 'Data Structures in Practice', description: 'Work with arrays, linked lists, stacks, queues, hash maps, trees, and graphs through programming exercises.', level: 'Intermediate', tag: 'Data Structures, Algorithms' },
  { id: 'cf-git', title: 'Git and GitHub Workflow', description: 'Manage source code with commits, branches, merges, pull requests, and collaborative version-control workflows.', level: 'Beginner', tag: 'Git, GitHub, Developer Tools' },
  { id: 'cf-linux', title: 'Linux Command Line Basics', description: 'Navigate files, manage processes, work with permissions, combine shell commands, and understand the terminal environment.', level: 'Beginner', tag: 'Linux, Terminal, Systems' },
  { id: 'cf-c', title: 'C Programming Foundations', description: 'Study C syntax, functions, arrays, pointers, memory concepts, and the structure of compiled programs.', level: 'Intermediate', tag: 'C, Systems Programming' },
  { id: 'cf-cpp', title: 'C++ Programming with OOP', description: 'Explore classes, objects, references, standard library containers, and object-oriented program design in C++.', level: 'Intermediate', tag: 'C++, OOP' },
  { id: 'cf-rust', title: 'Rust Programming Basics', description: 'Discover Rust syntax, ownership, borrowing, structs, enums, pattern matching, and safe systems programming concepts.', level: 'Intermediate', tag: 'Rust, Systems' },
  { id: 'cf-data-analysis', title: 'Data Analysis with Python', description: 'Introduce data cleaning, tabular data, visualization, exploratory analysis, and communicating findings with Python.', level: 'Intermediate', tag: 'Python, Data Science' },
  { id: 'cf-ml', title: 'Introduction to Machine Learning', description: 'Understand supervised learning, model training, evaluation, data preparation, and responsible machine-learning practice.', level: 'Advanced', tag: 'AI, Machine Learning, Data' },
  { id: 'cf-cloud', title: 'Cloud Computing Foundations', description: 'Learn cloud service models, deployment concepts, storage, scalability, and the basics of operating cloud applications.', level: 'Intermediate', tag: 'Cloud, Infrastructure' },
  { id: 'cf-security', title: 'Secure Coding Foundations', description: 'Explore input validation, authentication concepts, dependency awareness, data protection, and secure development habits.', level: 'Advanced', tag: 'Cybersecurity, Security' },
  { id: 'cf-devops', title: 'DevOps and CI/CD Essentials', description: 'Understand build automation, continuous integration, delivery pipelines, deployment workflows, and team collaboration.', level: 'Advanced', tag: 'DevOps, CI/CD, Automation' },
  { id: 'cf-networking', title: 'Computer Networking Basics', description: 'Study network layers, IP addressing, DNS, routing, HTTP, and the protocols that connect modern applications.', level: 'Beginner', tag: 'Networking, Computer Science' },
] as const;

const COURSE_LIBRARY = [...COURSE_LIST, ...EXTRA_COURSES];

type CourseRecord = (typeof COURSE_LIBRARY)[number];

function getCourseTags(course: CourseRecord): string[] {
  const raw = course.tag;
  if (Array.isArray(raw)) return raw.map((tag) => String(tag)).filter(Boolean);
  if (typeof raw === 'string') return raw.split(/[,|]/).map((tag) => tag.trim()).filter(Boolean);
  return [];
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function courseSlug(course: CourseRecord) {
  return `${slugify(String(course.id))}-${slugify(course.title)}`;
}

function readCourseSlugFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.match(/^\/courses\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function CourseLibraryCard({ course, onOpen }: { course: CourseRecord; onOpen: (course: CourseRecord) => void }) {
  const tags = getCourseTags(course);
  const levelTone = course.level === 'Beginner'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
    : course.level === 'Intermediate'
      ? 'bg-sky-50 text-sky-700 ring-sky-100'
      : 'bg-amber-50 text-amber-700 ring-amber-100';
 
  return (
    <button
      type="button"
      onClick={() => onOpen(course)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/[0.07] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20"
      aria-label={`Open course: ${course.title}`}
    >
      <div className="relative flex h-28 items-start justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-[#1c2b55] to-indigo-800 p-4">
        <div className="pointer-events-none absolute -right-5 -top-10 h-32 w-32 rounded-full border-[18px] border-white/[0.07]" />
        <div className="pointer-events-none absolute -bottom-12 left-20 h-28 w-28 rounded-full bg-indigo-300/10 blur-2xl" />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-sm">
          <Code2 size={21} />
        </span>
        <span className="relative rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/90">{course.level}</span>
        <span className="absolute bottom-3 right-4 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-100/55">CODEFORGE COURSE</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-indigo-600">{tag}</span>)}
        </div>
        <h3 className="text-sm font-extrabold leading-5 text-slate-900 transition group-hover:text-indigo-700">{course.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-xs leading-5 text-slate-500">{course.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${levelTone}`}>{course.level}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 transition group-hover:gap-2">View course <ArrowUpRight size={13} /></span>
        </div>
      </div>
    </button>
  );
}

function CourseDetailPage({ course, onBack }: { course: CourseRecord; onBack: () => void }) {
  const tags = getCourseTags(course);
  const outline = [
    { title: 'Getting started', detail: 'Course orientation, setup, and the key ideas behind this subject.' },
    { title: 'Core concepts', detail: 'Understand the essential terminology, techniques, and foundational patterns.' },
    { title: 'Guided examples', detail: 'Follow worked examples and see how the concepts are applied.' },
    { title: 'Practice and problem solving', detail: 'Reinforce the material with focused exercises and small challenges.' },
    { title: 'Build a practical project', detail: 'Bring several concepts together in a structured mini-project.' },
    { title: 'Review and next steps', detail: 'Review the main ideas and identify topics to explore next.' },
  ];

  return (
    <section className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-indigo-700">
        <ArrowLeft size={15} /> Back to course catalog
      </button>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111b39] via-[#1f3471] to-[#354fa3] p-6 text-white shadow-xl shadow-indigo-950/10 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[34px] border-white/[0.06]" />
        <div className="pointer-events-none absolute bottom-[-90px] right-1/3 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-100/80">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">CodeForge Academy</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">{course.level}</span>
            {tags.slice(0, 1).map((tag) => <span key={tag} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">{tag}</span>)}
          </div>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">{course.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100/85 sm:text-base">{course.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-indigo-100/85">
            <span className="inline-flex items-center gap-1.5"><GraduationCap size={15} /> {course.level} level</span>
            <span className="h-1 w-1 rounded-full bg-indigo-200/60" />
            <span className="inline-flex items-center gap-1.5"><PlayCircle size={15} /> Course overview</span>
            <span className="h-1 w-1 rounded-full bg-indigo-200/60" />
            <span className="inline-flex items-center gap-1.5"><FileText size={15} /> Learning outline preview</span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen size={17} /></span>
              <h2 className="text-base font-extrabold text-slate-900">About this course</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{course.description} This course page brings the subject overview, key topics, and a sample learning structure together in one place.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => <span key={tag} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">{tag}</span>)}
              {tags.length === 0 && <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">Programming</span>}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Target size={17} /></span>
              <div><h2 className="text-base font-extrabold text-slate-900">What you'll explore</h2><p className="mt-0.5 text-xs text-slate-400">A guided overview of the learning goals</p></div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                `Understand the foundations of ${course.title}`,
                'Recognize key concepts and common terminology',
                'Apply ideas through examples and practice',
                'Connect individual skills in a small project',
              ].map((item) => <div key={item} className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" /><span className="text-xs leading-5 text-slate-600">{item}</span></div>)}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><ListChecks size={17} /></span><div><h2 className="text-base font-extrabold text-slate-900">Course content</h2><p className="mt-0.5 text-xs text-slate-400">Illustrative outline · 6 sections</p></div></div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">Preview</span>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {outline.map((item, index) => (
                <details key={item.title} className="group py-3 first:pt-0 last:pb-0">
                  <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[11px] font-extrabold text-indigo-600">{String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-800">{item.title}</span><span className="mt-1 block text-[11px] text-slate-400">Click to preview this section</span></span>
                    <ChevronRight size={15} className="shrink-0 text-slate-400 transition group-open:rotate-90" />
                  </summary>
                  <p className="ml-11 mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">{item.detail} The lessons in this section would include explanations, examples, and practice activities.</p>
                </details>
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-900/15"><Code2 size={22} /></span>
            <h2 className="mt-4 text-sm font-extrabold text-slate-900">Course at a glance</h2>
            <div className="mt-4 divide-y divide-slate-100">
              <div className="flex items-center justify-between gap-3 py-3"><span className="text-xs text-slate-500">Difficulty</span><span className="text-xs font-bold text-slate-800">{course.level}</span></div>
              <div className="flex items-center justify-between gap-3 py-3"><span className="text-xs text-slate-500">Format</span><span className="text-xs font-bold text-slate-800">Self-paced design</span></div>
              <div className="flex items-center justify-between gap-3 py-3"><span className="text-xs text-slate-500">Content status</span><span className="text-xs font-bold text-amber-600">Preview</span></div>
            </div>
            <button onClick={onBack} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700">Back to course library <ArrowLeft size={14} /></button>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
            <div className="flex items-center gap-2 text-indigo-700"><Clock3 size={15} /><span className="text-xs font-extrabold">About this preview</span></div>
            <p className="mt-2 text-[11px] leading-5 text-indigo-800/75">This is a front-end course detail preview. Actual lessons, instructor information, duration, enrollment, and progress tracking can be connected when course data is available.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

type LandingPageProps = {
  query: string;
  onQueryChange: (q: string) => void;
  sessionEmail: string | null;
  onSignOut: () => void;
  onSignupClick: () => void;
  onSigninClick: () => void;
};

const NAV_ITEMS: {
  id: SectionId;
  label: string;
  icon: typeof LayoutDashboard;
  group: 'Learn' | 'More';
}[] = [
  { id: 'home', label: 'Home', icon: HomeIcon, group: 'Learn' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Learn' },
  { id: 'catalog', label: 'Course Catalog', icon: BookOpen, group: 'Learn' },
  { id: 'paths', label: 'Learning Paths', icon: Layers, group: 'Learn' },
  { id: 'certifications', label: 'Certifications', icon: Award, group: 'More' },
  { id: 'help', label: 'Help Center', icon: HelpCircle, group: 'More' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'More' },
];

const CERTIFICATIONS = [
  {
    name: 'Certified Rust Systems Developer',
    level: 'Advanced',
    category: 'Systems programming',
    description: 'Explore Rust, ownership, memory safety, concurrency, and the foundations of reliable systems software.',
    icon: Code2,
    tone: 'violet',
    skills: ['Rust', 'Memory safety', 'Concurrency', 'Systems'],
  },
  {
    name: 'Certified Distributed Systems Architect',
    level: 'Advanced',
    category: 'Software architecture',
    description: 'Study distributed application design, service communication, fault tolerance, and scalable architecture.',
    icon: Layers,
    tone: 'blue',
    skills: ['Architecture', 'Networking', 'Scalability', 'Reliability'],
  },
  {
    name: 'Certified Full-Stack TypeScript Engineer',
    level: 'Intermediate',
    category: 'Web development',
    description: 'Build a foundation across typed frontend development, server-side applications, and full-stack workflows.',
    icon: GraduationCap,
    tone: 'cyan',
    skills: ['TypeScript', 'React', 'APIs', 'Backend'],
  },
  {
    name: 'Certified CS Foundations',
    level: 'Beginner',
    category: 'Computer science',
    description: 'Strengthen core programming concepts, computational thinking, problem solving, and essential CS ideas.',
    icon: BookOpen,
    tone: 'amber',
    skills: ['Programming', 'Logic', 'Algorithms', 'Problem solving'],
  },
  {
    name: 'Certified Python Developer',
    level: 'Beginner',
    category: 'Programming languages',
    description: 'Demonstrate understanding of Python syntax, data types, control flow, functions, modules, and introductory projects.',
    icon: Terminal,
    tone: 'emerald',
    skills: ['Python', 'Functions', 'Data types', 'Debugging'],
  },
  {
    name: 'Certified Java Application Developer',
    level: 'Intermediate',
    category: 'Application development',
    description: 'Explore object-oriented programming, Java collections, exception handling, and application structure.',
    icon: Code2,
    tone: 'orange',
    skills: ['Java', 'OOP', 'Collections', 'Exceptions'],
  },
  {
    name: 'Certified Frontend Web Developer',
    level: 'Intermediate',
    category: 'Web development',
    description: 'Create accessible, responsive interfaces and understand the building blocks of modern browser applications.',
    icon: Globe,
    tone: 'blue',
    skills: ['HTML', 'CSS', 'JavaScript', 'Responsive UI'],
  },
  {
    name: 'Certified Backend API Engineer',
    level: 'Intermediate',
    category: 'Backend development',
    description: 'Learn the principles of server-side development, API design, request handling, and service integration.',
    icon: GitBranch,
    tone: 'violet',
    skills: ['REST APIs', 'Node.js', 'HTTP', 'Authentication'],
  },
  {
    name: 'Certified Data Structures & Algorithms',
    level: 'Intermediate',
    category: 'Problem solving',
    description: 'Develop practical knowledge of common data structures, algorithmic strategies, and complexity analysis.',
    icon: Activity,
    tone: 'cyan',
    skills: ['Arrays', 'Trees', 'Sorting', 'Big-O'],
  },
  {
    name: 'Certified Database Design Specialist',
    level: 'Intermediate',
    category: 'Data management',
    description: 'Understand relational data modeling, SQL queries, normalization, and the fundamentals of database design.',
    icon: Database,
    tone: 'teal',
    skills: ['SQL', 'Data modeling', 'Joins', 'Normalization'],
  },
  {
    name: 'Certified Cloud Computing Associate',
    level: 'Intermediate',
    category: 'Cloud technology',
    description: 'Get familiar with cloud concepts, deployment models, hosted services, and the building blocks of cloud systems.',
    icon: Cloud,
    tone: 'blue',
    skills: ['Cloud basics', 'Deployment', 'Storage', 'Services'],
  },
  {
    name: 'Certified Cybersecurity Foundations',
    level: 'Beginner',
    category: 'Security',
    description: 'Learn essential security principles, safe development practices, common risks, and basic threat awareness.',
    icon: ShieldCheck,
    tone: 'rose',
    skills: ['Security basics', 'Privacy', 'Threats', 'Safe coding'],
  },
  {
    name: 'Certified AI & Machine Learning Practitioner',
    level: 'Advanced',
    category: 'Artificial intelligence',
    description: 'Explore machine learning workflows, data preparation, model evaluation, and responsible AI concepts.',
    icon: Cpu,
    tone: 'violet',
    skills: ['Machine learning', 'Data', 'Model evaluation', 'AI'],
  },
  {
    name: 'Certified DevOps & Automation Engineer',
    level: 'Advanced',
    category: 'Development operations',
    description: 'Understand delivery pipelines, automation, version control workflows, and collaboration between development and operations.',
    icon: GitBranch,
    tone: 'orange',
    skills: ['CI/CD', 'Git', 'Automation', 'Delivery'],
  },
  {
    name: 'Certified Mobile App Developer',
    level: 'Intermediate',
    category: 'Mobile development',
    description: 'Explore mobile interface patterns, application structure, device capabilities, and cross-platform concepts.',
    icon: Smartphone,
    tone: 'teal',
    skills: ['Mobile UI', 'App structure', 'Navigation', 'UX'],
  },
  {
    name: 'Certified Computer Networks Specialist',
    level: 'Advanced',
    category: 'Networking',
    description: 'Study network architecture, communication protocols, addressing, and the concepts that connect modern systems.',
    icon: Globe,
    tone: 'amber',
    skills: ['TCP/IP', 'Protocols', 'Routing', 'Networking'],
  },
] as const;

const sectionTitles: Record<SectionId, string> = {
  home: 'Home',
  dashboard: 'Dashboard',
  catalog: 'Course Catalog',
  paths: 'Learning Paths',
  certifications: 'Certifications',
  help: 'Help Center',
  settings: 'Settings',
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: typeof BookOpen;
  accent: 'indigo' | 'blue' | 'amber' | 'emerald';
}) {
  const accents = {
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    blue: 'bg-sky-50 text-sky-600 ring-sky-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  };

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1', accents[accent])}>
          <Icon size={19} />
        </span>
      </div>
    </div>
  );
}

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(() => readCourseSlugFromUrl());
  const [catalogReturnUrl, setCatalogReturnUrl] = useState('/');

  useEffect(() => {
    const syncCourseRoute = () => setSelectedCourseSlug(readCourseSlugFromUrl());
    window.addEventListener('popstate', syncCourseRoute);
    return () => window.removeEventListener('popstate', syncCourseRoute);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSE_LIBRARY.filter((course) => {
      if (levelFilter && course.level !== levelFilter) return false;
      if (!q) return true;
      return (
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.level.toLowerCase().includes(q) ||
        getCourseTags(course).join(' ').toLowerCase().includes(q)
      );
    });
  }, [query, levelFilter]);

  const byLevel = useMemo(
    () => ({
      Beginner: filtered.filter((course) => course.level === 'Beginner'),
      Intermediate: filtered.filter((course) => course.level === 'Intermediate'),
      Advanced: filtered.filter((course) => course.level === 'Advanced'),
    }),
    [filtered],
  );

  const courseCounts = useMemo(
    () => ({
      Beginner: COURSE_LIBRARY.filter((course) => course.level === 'Beginner').length,
      Intermediate: COURSE_LIBRARY.filter((course) => course.level === 'Intermediate').length,
      Advanced: COURSE_LIBRARY.filter((course) => course.level === 'Advanced').length,
    }),
    [],
  );

  const selectedCourse = COURSE_LIBRARY.find((course) => courseSlug(course) === selectedCourseSlug) ?? null;

  const openCourse = (course: CourseRecord) => {
    const destination = `/courses/${courseSlug(course)}`;
    setCatalogReturnUrl(window.location.pathname.startsWith('/courses/') ? '/' : `${window.location.pathname}${window.location.search}`);
    window.history.pushState({ codeforgeCourse: String(course.id) }, '', destination);
    setSelectedCourseSlug(courseSlug(course));
    setNotificationsOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const closeCourse = () => {
    const destination = catalogReturnUrl.startsWith('/courses/') ? '/' : catalogReturnUrl;
    window.history.pushState({}, '', destination || '/');
    setSelectedCourseSlug(null);
    setSection('catalog');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const userLabel = sessionEmail?.split('@')[0] ?? 'there';
  const userInitial = sessionEmail?.charAt(0).toUpperCase() ?? 'G';
  const activeTitle = sectionTitles[section];

  const navigateTo = (nextSection: SectionId) => {
    if (selectedCourseSlug) {
      window.history.pushState({}, '', '/');
      setSelectedCourseSlug(null);
    }
    setSection(nextSection);
    setSidebarOpen(false);
    setNotificationsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc] text-slate-900">
      <div className="min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex h-screen w-[276px] flex-col border-r border-slate-800/80 bg-[#10172a] text-white shadow-2xl shadow-slate-950/20 transition-transform duration-300 lg:z-20 lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-5">
              <button onClick={() => navigateTo('home')} className="flex items-center gap-3 text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-950/50 ring-1 ring-white/15">
                  <Code2 size={21} />
                </span>
                <span>
                  <span className="block text-sm font-extrabold tracking-tight text-white">
                    CodeForge <span className="text-indigo-300">Academy</span>
                  </span>
                  <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Learn · Build · Grow
                  </span>
                </span>
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-5 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,.35)_transparent]">
              <div className="mb-6 rounded-2xl border border-indigo-300/15 bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-blue-500/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200">Learning space</span>
                  <Sparkles size={15} className="text-indigo-200" />
                </div>
                <p className="mt-2 text-sm font-semibold text-white">Build your next skill.</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Explore courses and find a path that matches your goals.</p>
                <button
                  onClick={() => navigateTo('catalog')}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-200 transition hover:text-white"
                >
                  Explore courses <ArrowUpRight size={13} />
                </button>
              </div>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
              {(['Learn', 'More'] as const).map((group) => (
                <div key={group} className="mb-5">
                  {group === 'More' && (
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Resources</p>
                  )}
                  <div className="space-y-1">
                    {NAV_ITEMS.filter((item) => item.group === group).map(({ id, label, icon: Icon }) => {
                      const active = section === id;
                      return (
                        <button
                          key={id}
                          onClick={() => navigateTo(id)}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition duration-150',
                            active
                              ? 'bg-indigo-500/20 text-white shadow-inner shadow-indigo-300/5'
                              : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100',
                          )}
                        >
                          <span className={cn('absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-indigo-300 transition', active ? 'opacity-100' : 'opacity-0')} />
                          <Icon size={17} className={active ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'} />
                          <span>{label}</span>
                          {active && <ChevronRight size={15} className="ml-auto text-indigo-300" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="relative mx-4 mb-4 shrink-0 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                  <Activity size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200">Course library</p>
                  <p className="text-[11px] text-slate-500">{COURSE_LIBRARY.length} courses available</p>
                </div>
              </div>
              <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-slate-700/70">
                <span className="bg-indigo-400" style={{ width: `${COURSE_LIBRARY.length ? (courseCounts.Beginner / COURSE_LIBRARY.length) * 100 : 0}%` }} />
                <span className="bg-sky-400" style={{ width: `${COURSE_LIBRARY.length ? (courseCounts.Intermediate / COURSE_LIBRARY.length) * 100 : 0}%` }} />
                <span className="bg-amber-300" style={{ width: `${COURSE_LIBRARY.length ? (courseCounts.Advanced / COURSE_LIBRARY.length) * 100 : 0}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                <span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400" />Beginner</span>
                <span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />Intermediate</span>
                <span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-300" />Advanced</span>
              </div>
            </div>

            <div className="relative shrink-0 border-t border-white/10 p-4">
              {sessionEmail ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-sm font-bold text-white ring-2 ring-white/10">
                      {userInitial}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-white">{userLabel}</p>
                      <p className="truncate text-[10px] text-slate-500">{sessionEmail}</p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/10" title="Signed in" />
                  </div>
                  <button
                    onClick={onSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-200"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button onClick={onSignupClick} className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:brightness-110">
                    Create student account
                  </button>
                  <button onClick={onSigninClick} className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                    Student sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main application area: scrolls independently while the desktop sidebar remains fixed */}
        <div className="min-w-0 min-h-screen lg:ml-[276px]">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
            <div className="flex min-h-[76px] items-center gap-3 px-4 sm:px-6 xl:px-8">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 lg:hidden"
                aria-label="Open navigation"
              >
                <LayoutDashboard size={17} />
              </button>

              <div className="hidden min-w-[155px] sm:block">
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                  <span>CodeForge</span><ChevronRight size={12} /><span className="text-slate-600">{activeTitle}</span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-800">Your learning workspace</p>
              </div>

              <div className="relative ml-auto w-full max-w-md">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Search courses, topics, or skills..."
                  aria-label="Search courses"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen((open) => !open)}
                  aria-label="Toggle notifications"
                  aria-expanded={notificationsOpen}
                  className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Bell size={17} />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-14 z-50 w-[min(330px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Notifications</p>
                        <p className="text-[11px] text-slate-500">Your learning updates</p>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">Preview</span>
                    </div>
                    <div className="flex gap-3 px-4 py-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Sparkles size={16} /></span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Keep exploring</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">Visit the course catalog to discover your next programming topic.</p>
                        <button onClick={() => navigateTo('catalog')} className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700">Browse courses <span aria-hidden="true">→</span></button>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-center text-[10px] text-slate-400">This is a sample notification panel.</div>
                  </div>
                )}
              </div>

              <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-xs font-bold text-white shadow-sm">
                  {userInitial}
                </span>
                <div className="hidden min-w-0 xl:block">
                  <p className="max-w-[120px] truncate text-xs font-bold text-slate-800">{sessionEmail ? userLabel : 'Guest learner'}</p>
                  <p className="text-[10px] text-slate-400">{sessionEmail ? 'Student account' : 'Preview mode'}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 xl:px-9">
            {selectedCourse ? (
              <CourseDetailPage course={selectedCourse} onBack={closeCourse} />
            ) : (
              <>
            {section === 'home' && (
              <>
                <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#172554] via-[#253b83] to-[#3157b7] p-6 text-white shadow-xl shadow-indigo-950/10 sm:p-8">
                  <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div className="pointer-events-none absolute -right-4 -top-24 h-64 w-64 rounded-full border-[32px] border-white/[0.06]" />
                    <div className="pointer-events-none absolute right-40 top-8 hidden h-20 w-20 rounded-2xl border border-white/10 rotate-12 lg:block" />
                    <div className="relative max-w-2xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-100">
                        <Sparkles size={13} /> Your coding journey starts here
                      </div>
                      <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">Welcome back, {sessionEmail ? userLabel : 'learner'}.</h1>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/85">Explore practical courses, build stronger foundations, and turn what you learn into projects you can be proud of.</p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button onClick={() => navigateTo('catalog')} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50">
                          Explore courses <ArrowUpRight size={15} />
                        </button>
                        <button onClick={() => navigateTo('paths')} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/15">
                          View learning paths <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="relative grid grid-cols-2 gap-2 sm:min-w-[250px]">
                      <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                        <BookOpen size={18} className="text-blue-200" />
                        <p className="mt-3 text-2xl font-extrabold">{COURSE_LIBRARY.length}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-blue-100/70">Courses</p>
                      </div>
                      <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                        <Layers size={18} className="text-blue-200" />
                        <p className="mt-3 text-2xl font-extrabold">3</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-blue-100/70">Skill levels</p>
                      </div>
                      <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300/15 text-amber-200"><Flame size={18} /></span>
                        <div>
                          <p className="text-xs font-bold">Small steps. Real progress.</p>
                          <p className="mt-0.5 text-[10px] text-blue-100/70">Choose a topic and start learning today.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Home
                  userName={sessionEmail?.split('@')[0] ?? null}
                  query={query}
                  onQueryChange={onQueryChange}
                  onExploreCatalog={() => navigateTo('catalog')}
                />
              </>
            )}

            {section === 'dashboard' && (
              <>
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-500">Your overview</p>
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Learning dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">A central place to review your learning activity.</p>
                  </div>
                  <span className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 sm:self-auto"><CheckCircle2 size={13} /> Workspace ready</span>
                </div>
                <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Available courses" value={COURSE_LIBRARY.length} helper="In the course catalog" icon={BookOpen} accent="indigo" />
                  <StatCard label="Beginner courses" value={courseCounts.Beginner} helper="Start with the fundamentals" icon={Zap} accent="emerald" />
                  <StatCard label="Intermediate" value={courseCounts.Intermediate} helper="Build on your knowledge" icon={Activity} accent="blue" />
                  <StatCard label="Advanced courses" value={courseCounts.Advanced} helper="Explore deeper topics" icon={GraduationCap} accent="amber" />
                </div>
                <Dashboard
                  userName={sessionEmail?.split('@')[0] ?? null}
                  onGoToCatalog={() => navigateTo('catalog')}
                  onOpenCourse={() => navigateTo('catalog')}
                />
              </>
            )}

            {section === 'catalog' && (
              <section>
                <div className="mb-6 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/70 to-sky-50 p-6 sm:p-7">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700"><BookOpen size={13} /> Explore the library</div>
                      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Course Catalog</h1>
                      <p className="mt-2 text-sm leading-6 text-slate-600">Find a course that fits your current skills and the direction you want to grow in. Browse by level or search for a topic.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm"><span className="mr-1.5 text-indigo-600">{COURSE_LIBRARY.length}</span> total courses</span>
                      <span className="rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm"><span className="mr-1.5 text-indigo-600">3</span> difficulty levels</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                  <StatCard label="Beginner" value={courseCounts.Beginner} helper="Start with the basics" icon={Zap} accent="emerald" />
                  <StatCard label="Intermediate" value={courseCounts.Intermediate} helper="Develop practical skills" icon={Activity} accent="blue" />
                  <StatCard label="Advanced" value={courseCounts.Advanced} helper="Explore complex topics" icon={GraduationCap} accent="amber" />
                </div>

                <div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><SlidersHorizontal size={16} /></span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Browse by difficulty</p>
                      <p className="text-[11px] text-slate-400">Choose a level to narrow the catalog</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button onClick={() => setLevelFilter(null)} className={cn('rounded-lg px-3 py-2 text-xs font-bold transition', levelFilter === null ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>All levels</button>
                    {LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setLevelFilter((current) => (current === level ? null : level))}
                        aria-pressed={levelFilter === level}
                        className={cn('rounded-lg px-3 py-2 text-xs font-bold transition', levelFilter === level ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">Showing <span className="font-bold text-slate-800">{filtered.length}</span> of <span className="font-bold text-slate-800">{COURSE_LIBRARY.length}</span> courses</p>
                  {(query || levelFilter) && <button onClick={() => { onQueryChange(''); setLevelFilter(null); }} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Clear all filters</button>}
                </div>

                {filtered.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Search size={23} /></span>
                    <h2 className="mt-4 text-base font-bold text-slate-800">No courses found</h2>
                    <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">We couldn't find a course matching your search and selected level. Try another keyword or reset your filters.</p>
                    <button onClick={() => { onQueryChange(''); setLevelFilter(null); }} className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700">Reset filters</button>
                  </div>
                ) : (
                  <div className="space-y-9">
                    {LEVELS.map((level) =>
                      byLevel[level].length > 0 ? (
                        <div key={level}>
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', level === 'Beginner' ? 'bg-emerald-50 text-emerald-600' : level === 'Intermediate' ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600')}>
                                {level === 'Beginner' ? <Zap size={17} /> : level === 'Intermediate' ? <Activity size={17} /> : <GraduationCap size={17} />}
                              </span>
                              <div>
                                <h2 className="text-sm font-extrabold text-slate-900">{level}</h2>
                                <p className="text-[11px] text-slate-400">{level === 'Beginner' ? 'Build your foundation' : level === 'Intermediate' ? 'Strengthen your skills' : 'Go deeper into the subject'}</p>
                              </div>
                            </div>
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500">{byLevel[level].length} {byLevel[level].length === 1 ? 'course' : 'courses'}</span>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {byLevel[level].map((course) => <CourseLibraryCard key={course.id} course={course} onOpen={openCourse} />)}
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
                <div className="mb-6 rounded-3xl bg-gradient-to-r from-[#27204f] via-[#3a3473] to-[#4d5da2] p-6 text-white shadow-xl shadow-indigo-950/10 sm:p-8">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="max-w-2xl">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-100"><Award size={13} /> Achievements</span>
                      <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Certifications</h1>
                      <p className="mt-2 text-sm leading-6 text-indigo-100/80">Explore a broader collection of learning tracks across programming, web development, data, systems, cloud technology, and computer science.</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/15 text-amber-200"><ShieldCheck size={22} /></span>
                      <div><p className="text-2xl font-extrabold">{CERTIFICATIONS.length}</p><p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100/70">Track previews</p></div>
                    </div>
                  </div>
                </div>

                <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Available certification tracks</h2>
                    <p className="mt-1 text-xs text-slate-500">Compare each track by subject area, difficulty, and the skills it introduces.</p>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{CERTIFICATIONS.length} example tracks</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {CERTIFICATIONS.map((cert) => {
                    const Icon = cert.icon;
                    const toneClass = {
                      violet: 'bg-violet-50 text-violet-600 ring-violet-100',
                      blue: 'bg-blue-50 text-blue-600 ring-blue-100',
                      cyan: 'bg-cyan-50 text-cyan-600 ring-cyan-100',
                      amber: 'bg-amber-50 text-amber-600 ring-amber-100',
                      emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
                      orange: 'bg-orange-50 text-orange-600 ring-orange-100',
                      teal: 'bg-teal-50 text-teal-600 ring-teal-100',
                      rose: 'bg-rose-50 text-rose-600 ring-rose-100',
                    }[cert.tone];
                    return (
                      <article key={cert.name} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl ring-1', toneClass)}><Icon size={21} /></span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{cert.level}</span>
                        </div>
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500">{cert.category}</p>
                        <h3 className="mt-1 text-base font-extrabold leading-6 text-slate-900">{cert.name}</h3>
                        <p className="mt-2 text-xs leading-6 text-slate-500">{cert.description}</p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {cert.skills.map((skill) => <span key={skill} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500">{skill}</span>)}
                        </div>
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500"><Star size={12} className="text-amber-400" /> Learning track</span>
                          <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">{cert.skills.length} key skills</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-[11px] leading-5 text-amber-800">These are sample certification-track concepts for the academy interface. They are not accredited credentials; exam registration, assessment, verification, and certificate issuance would need to be implemented separately.</p>
              </section>
            )}

            {section === 'help' && <Help />}

            {section === 'settings' && (
              <section className="max-w-3xl">
                <div className="mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-500">Preferences</p>
                  <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Settings</h1>
                  <p className="mt-1 text-sm text-slate-500">Review your account information and available account actions.</p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Settings size={20} /></span>
                    <div><h2 className="text-sm font-extrabold text-slate-900">Account information</h2><p className="mt-0.5 text-xs text-slate-500">Your current sign-in status</p></div>
                  </div>
                  {sessionEmail ? (
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-xl font-extrabold text-white">{userInitial}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900">{userLabel}</p>
                          <p className="mt-1 break-all text-xs text-slate-500">{sessionEmail}</p>
                          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 size={12} /> Signed in</span>
                        </div>
                        <button onClick={onSignOut} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"><LogOut size={14} /> Sign out</button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><GraduationCap size={23} /></span>
                        <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-900">You are browsing as a guest</p><p className="mt-1 text-xs leading-5 text-slate-500">Sign in to access your student account and manage your learning preferences.</p></div>
                        <div className="flex gap-2"><button onClick={onSigninClick} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">Sign in</button><button onClick={onSignupClick} className="rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700">Apply now</button></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><BookOpen size={18} /></span>
                    <div><h2 className="text-sm font-extrabold text-slate-900">Learning preferences</h2><p className="mt-0.5 text-xs text-slate-500">Overview of the learning content currently available</p></div>
                  </div>
                  <div className="mt-4 divide-y divide-slate-100">
                    <div className="flex items-center justify-between gap-3 py-3"><span className="text-xs font-medium text-slate-600">Course catalog</span><span className="text-xs font-bold text-slate-900">{COURSE_LIBRARY.length} courses</span></div>
                    <div className="flex items-center justify-between gap-3 py-3"><span className="text-xs font-medium text-slate-600">Difficulty levels</span><span className="text-xs font-bold text-slate-900">Beginner · Intermediate · Advanced</span></div>
                    <div className="flex items-center justify-between gap-3 py-3"><span className="text-xs font-medium text-slate-600">Certification previews</span><span className="text-xs font-bold text-slate-900">{CERTIFICATIONS.length} tracks</span></div>
                  </div>
                </div>
              </section>
            )}
              </>
            )}
          </main>

          <footer className="mt-8 border-t border-slate-200/80 bg-white/70">
            <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-4 py-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 xl:px-9">
              <p>© {new Date().getFullYear()} CodeForge Academy. All rights reserved.</p>
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Learning platform</span>
                <span>Built for curious minds</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
