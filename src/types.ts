export interface Course {
  id: number;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: number;
  hours: number;
  tag: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at?: string | null;
  recalled_at?: string | null;
}
