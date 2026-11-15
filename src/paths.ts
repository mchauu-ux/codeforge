export interface PathMilestone {
  title: string;
  courseId?: number;
  detail: string;
}

export interface LearningPath {
  id: number;
  name: string;
  tagline: string;
  salary: string;
  demand: 'High' | 'Very high' | 'Explosive';
  milestones: PathMilestone[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 1,
    name: 'Full-Stack Web Architect',
    tagline: 'From first request to production system: own every layer of a modern web product.',
    salary: '$120k–$190k',
    demand: 'Very high',
    milestones: [
      { title: 'Foundations of Computer Science', courseId: 6, detail: 'Data structures and complexity thinking as bedrock.' },
      { title: 'Full-Stack TypeScript', courseId: 4, detail: 'One typed language from database to pixels.' },
      { title: 'Databases Under the Hood', courseId: 7, detail: 'Make the data layer fast and correct.' },
      { title: 'Distributed Systems Architecture', courseId: 2, detail: 'Scale beyond a single machine.' },
      { title: 'Capstone: Architect a SaaS product', detail: 'End-to-end design review with faculty.' },
    ],
  },
  {
    id: 2,
    name: 'Systems & Embedded C++ / Robotics',
    tagline: 'Program the metal: performance-critical software from drivers to robots.',
    salary: '$110k–$175k',
    demand: 'High',
    milestones: [
      { title: 'Foundations of Computer Science', courseId: 6, detail: 'Memory model and low-level intuition.' },
      { title: 'Systems Programming in Rust', courseId: 1, detail: 'Modern systems discipline with zero-cost safety.' },
      { title: 'Modern Compiler Design', courseId: 3, detail: 'Understand the toolchain end to end.' },
      { title: 'Capstone: Build a robot controller', detail: 'Real-time firmware on commodity hardware.' },
    ],
  },
  {
    id: 3,
    name: 'Advanced Algorithms & AI',
    tagline: 'The mathematical core behind search, ranking, and modern machine learning.',
    salary: '$130k–$210k',
    demand: 'Explosive',
    milestones: [
      { title: 'Foundations of Computer Science', courseId: 6, detail: 'Discrete math and proof techniques.' },
      { title: 'Algorithm Deep Dives', courseId: 5, detail: 'The structures powering real systems.' },
      { title: 'Databases Under the Hood', courseId: 7, detail: 'Where algorithms meet data at scale.' },
      { title: 'Applied Cryptography', courseId: 8, detail: 'Hard problems and their guarantees.' },
      { title: 'Capstone: Research write-up', detail: 'Publish-quality analysis with peer review.' },
    ],
  },
  {
    id: 4,
    name: 'Security Engineering',
    tagline: 'Break systems to understand them, then build ones that hold.',
    salary: '$115k–$185k',
    demand: 'Very high',
    milestones: [
      { title: 'Foundations of Computer Science', courseId: 6, detail: 'How software actually executes.' },
      { title: 'Applied Cryptography', courseId: 8, detail: 'Primitives used correctly and incorrectly.' },
      { title: 'Distributed Systems Architecture', courseId: 2, detail: 'Attack surface of real infrastructure.' },
      { title: 'Systems Programming in Rust', courseId: 1, detail: 'Memory-safe systems as a defense.' },
      { title: 'Capstone: Full security audit', detail: 'Engagement-style report on a live system.' },
    ],
  },
];
