import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { ChatMessage } from '../types';

export interface MessageEdit {
  id: string;
  message_id: string;
  editor_id: string;
  old_content: string;
  created_at: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

interface UseRealtimeMessagesResult {
  messages: ChatMessage[];
  reactions: MessageReaction[];
  edits: MessageEdit[];
  connected: boolean;
  sendMessage: (content: string) => Promise<{ error: string | null }>;
  toggleReaction: (messageId: string, emoji: string) => Promise<{ error: string | null }>;
  togglePin: (msg: ChatMessage) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  editMessage: (id: string, content: string) => Promise<{ error: string | null }>;
  recallMessage: (id: string) => Promise<{ error: string | null }>;
}

export function useRealtimeMessages(
  senderId: string | null,
  isMounted: () => boolean,
): UseRealtimeMessagesResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [edits, setEdits] = useState<MessageEdit[]>([]);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [{ data, error }, { data: reactionRows, error: reactionError }, { data: editRows, error: editError }] = await Promise.all([
        supabase.from('messages').select('*').order('created_at', { ascending: true }),
        supabase.from('message_reactions').select('*'),
        supabase.from('message_edits').select('*').order('created_at', { ascending: true }),
      ]);

      if (cancelled || !isMounted()) return;
      if (error) {
        console.error('Failed to load messages:', error.message);
        setMessages([]);
      } else {
        setMessages((data ?? []) as ChatMessage[]);
      }
      if (reactionError) {
        console.error('Failed to load reactions:', reactionError.message);
      } else {
        setReactions((reactionRows ?? []) as MessageReaction[]);
      }
      if (editError) {
        console.error('Failed to load edit history:', editError.message);
      } else {
        setEdits((editRows ?? []) as MessageEdit[]);
      }
    };

    void load();

    const channel = supabase
      .channel('terminal-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const row = payload.new as ChatMessage;
        setMessages((prev) => prev.some((m) => m.id === row.id) ? prev : [...prev, row]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const row = payload.new as ChatMessage;
        setMessages((prev) => prev.map((m) => m.id === row.id ? { ...m, is_pinned: row.is_pinned, content: row.content, recalled_at: row.recalled_at, updated_at: row.updated_at } : m));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        const { id } = payload.old as { id: string };
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setReactions((prev) => prev.filter((r) => r.message_id !== id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_edits' }, (payload) => {
        const row = payload.new as MessageEdit;
        setEdits((prev) => prev.some((edit) => edit.id === row.id) ? prev : [...prev, row]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as MessageReaction;
          setReactions((prev) => prev.some((r) => r.id === row.id) ? prev : [...prev, row]);
        } else if (payload.eventType === 'DELETE') {
          const row = payload.old as MessageReaction;
          setReactions((prev) => prev.filter((r) => r.id !== row.id));
        }
      })
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'));

    channelRef.current = channel;
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

 const sendMessage = async (content: string): Promise<{ error: string | null }> => {
  if (!senderId) return { error: 'Not signed in' };

  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError) return { error: authError.message };
  if (!user?.email) return { error: 'User email not found' };

  const { error } = await supabase
    .from('messages')
    .insert({
      content,
      email: user.email,
    });

  return { error: error?.message ?? null };
};

  const toggleReaction = async (messageId: string, emoji: string): Promise<{ error: string | null }> => {
    if (!senderId) return { error: 'Not signed in' };
    const existing = reactions.find((r) => r.message_id === messageId && r.user_id === senderId && r.emoji === emoji);
    if (existing) {
      const { error } = await supabase.from('message_reactions').delete().eq('id', existing.id);
      return { error: error?.message ?? null };
    }
    const { error } = await supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: senderId,
      emoji,
    });
    return { error: error?.message ?? null };
  };

  const togglePin = async (msg: ChatMessage): Promise<void> => {
    const { error } = await supabase.from('messages').update({ is_pinned: !msg.is_pinned }).eq('id', msg.id);
    if (error) console.error('Pin update failed:', error.message);
  };

  const deleteMessage = async (id: string): Promise<void> => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) console.error('Delete failed:', error.message);
  };

  const editMessage = async (id: string, content: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('messages').update({ content }).eq('id', id);
    return { error: error?.message ?? null };
  };

  const recallMessage = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('messages').update({ recalled_at: new Date().toISOString() }).eq('id', id);
    return { error: error?.message ?? null };
  };

  return { messages, reactions, edits, connected, sendMessage, toggleReaction, togglePin, deleteMessage, editMessage, recallMessage };
}
