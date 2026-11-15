import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { ChatMessage } from '../types';

interface UseRealtimeMessagesResult {
  messages: ChatMessage[];
  connected: boolean;
  sendMessage: (content: string) => Promise<{ error: string | null }>;
  togglePin: (msg: ChatMessage) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

export function useRealtimeMessages(
  senderId: string | null,
  isMounted: () => boolean,
): UseRealtimeMessagesResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (cancelled || !isMounted()) return;
      if (error) {
        console.error('Failed to load messages:', error.message);
        setMessages([]);
        return;
      }
      setMessages((data ?? []) as ChatMessage[]);
    };

    load();

    const channel = supabase
      .channel('terminal-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, row],
          );
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === row.id ? { ...m, is_pinned: row.is_pinned } : m)),
          );
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          const { id } = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== id));
        },
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  const sendMessage = async (content: string): Promise<{ error: string | null }> => {
  if (!senderId) return { error: 'Not signed in' };

  const { error } = await supabase
    .from('messages')
    .insert({
      content,
      sender_id: senderId,
    });

  return { error: error ? error.message : null };
};

  const togglePin = async (msg: ChatMessage): Promise<void> => {
    const { error } = await supabase
      .from('messages')
      .update({ is_pinned: !msg.is_pinned })
      .eq('id', msg.id);
    if (error) console.error('Pin update failed:', error.message);
  };

  const deleteMessage = async (id: string): Promise<void> => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) console.error('Delete failed:', error.message);
  };

  return { messages, connected, sendMessage, togglePin, deleteMessage };
}
