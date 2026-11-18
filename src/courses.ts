import type { Course } from './types';

export const COURSES: Course[] = [
  {
    id: 1,
    title: 'Systems Programming in Rust',
    description:
      'Master memory safety, ownership, and zero-cost abstractions while building high-performance systems tools from scratch.',
    level: 'Advanced',
    lessons: 48,
    hours: 36,
    tag: 'rust',
  },
  {
    id: 2,
    title: 'Distributed Systems Architecture',
    description:
      'Consensus, replication, partitioning, and fault tolerance. Design services that survive datacenter loss.',
    level: 'Advanced',
    lessons: 42,
    hours: 40,
    tag: 'distributed',
  },
  {
    id: 3,
    title: 'Modern Compiler Design',
    description:
      'Lexing, parsing, type checking, and code generation. Ship a working compiler for a small language by course end.',
    level: 'Advanced',
    lessons: 38,
    hours: 32,
    tag: 'compilers',
  },
  {
    id: 4,
    title: 'Full-Stack TypeScript',
    description:
      'React, Node, and PostgreSQL in one coherent stack. End-to-end types from database schema to UI props.',
    level: 'Intermediate',
    lessons: 56,
    hours: 44,
    tag: 'typescript',
  },
  {
    id: 5,
    title: 'Algorithm Deep Dives',
    description:
      'Beyond interview prep: amortized analysis, randomized algorithms, and the structures that power real databases.',
    level: 'Intermediate',
    lessons: 40,
    hours: 30,
    tag: 'algorithms',
  },
  {
    id: 6,
    title: 'Foundations of Computer Science',
    description:
      'Data structures, complexity, and discrete math for working engineers. The bedrock every other course builds on.',
    level: 'Beginner',
    lessons: 60,
    hours: 45,
    tag: 'fundamentals',
  },
  {
    id: 7,
    title: 'Databases Under the Hood',
    description:
      'B-trees, WAL, query planners, and transactions. Understand why your queries are slow and what the engine is really doing.',
    level: 'Intermediate',
    lessons: 34,
    hours: 26,
    tag: 'databases',
  },
  {
    id: 8,
    title: 'Applied Cryptography',
    description:
      'Hashes, ciphers, key exchange, and the protocols securing the web. Learn to use crypto correctly, not invent your own.',
    level: 'Advanced',
    lessons: 30,
    hours: 24,
    tag: 'security',
  },
];
