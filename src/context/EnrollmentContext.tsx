import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

export interface Enrollment {
  courseId: number;
  lessonsDone: number;
  startedAt: string;
}

interface EnrollmentContextValue {
  enrollments: Record<number, Enrollment>;
  enroll: (courseId: number) => void;
  advance: (courseId: number, totalLessons: number) => void;
  progressOf: (courseId: number, totalLessons: number) => number;
}

const EnrollmentContext = createContext<EnrollmentContextValue | null>(null);

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [enrollments, setEnrollments] = useState<Record<number, Enrollment>>(() => {
    try {
      const saved = localStorage.getItem('codeforge-enrollments');
      return saved ? (JSON.parse(saved) as Record<number, Enrollment>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('codeforge-enrollments', JSON.stringify(enrollments));
    } catch (error) {
      console.warn('Could not persist enrollment progress:', error);
    }
  }, [enrollments]);

  const enroll = useCallback((courseId: number) => {
    setEnrollments((prev) =>
      prev[courseId]
        ? prev
        : {
            ...prev,
            [courseId]: {
              courseId,
              lessonsDone: 0,
              startedAt: new Date().toISOString(),
            },
          },
    );
  }, []);

  const advance = useCallback((courseId: number, totalLessons: number) => {
    setEnrollments((prev) => {
      const current = prev[courseId];
      if (!current) return prev;
      return {
        ...prev,
        [courseId]: {
          ...current,
          lessonsDone: Math.min(current.lessonsDone + 1, totalLessons),
        },
      };
    });
  }, []);

  const progressOf = useCallback(
    (courseId: number, totalLessons: number) => {
      const e = enrollments[courseId];
      if (!e || totalLessons === 0) return 0;
      return Math.round((e.lessonsDone / totalLessons) * 100);
    },
    [enrollments],
  );

  const value = useMemo(
    () => ({ enrollments, enroll, advance, progressOf }),
    [enrollments, enroll, advance, progressOf],
  );

  return (
    <EnrollmentContext.Provider value={value}>{children}</EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const ctx = useContext(EnrollmentContext);
  if (!ctx) throw new Error('useEnrollment must be used within EnrollmentProvider');
  return ctx;
}
