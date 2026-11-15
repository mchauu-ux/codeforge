export interface Certification {
  id: string;
  name: string;
  level: 'Foundational' | 'Professional' | 'Expert';
  courseIds: number[];
  hash: string;
  status: 'earned' | 'in-progress';
  issuedTo?: string;
  issuedOn?: string;
  verifyUrl?: string;
}

export const CATALOG: Record<string, Omit<Certification, 'id' | 'hash'>> = {
  csf: {
    name: 'Certified CS Foundations',
    level: 'Foundational',
    courseIds: [6],
    status: 'earned',
    issuedTo: 'Alex Rivera',
    issuedOn: 'Sep 2026',
  },
  fst: {
    name: 'Certified Full-Stack TypeScript Engineer',
    level: 'Professional',
    courseIds: [4, 7],
    status: 'in-progress',
  },
  rust: {
    name: 'Certified Rust Systems Developer',
    level: 'Expert',
    courseIds: [1],
    status: 'in-progress',
  },
  dist: {
    name: 'Certified Distributed Systems Architect',
    level: 'Expert',
    courseIds: [2, 5],
    status: 'in-progress',
  },
};
