import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { ChatMessage } from '../types';

const CHAT_MEDIA_BUCKET = 'chat-attachments';
const SIGNED_URL_LIFETIME_SECONDS = 60 * 60 * 24 * 7; // 7 days; refreshed whenever messages are loaded.

interface StoredChatMedia {
  __codeforge_media_v1: true;
  bucket: string;
  path: string;
  name: string;
  type: string;
  size: number;
  url?: string | null;
}

function parseStoredChatMedia(content: string): StoredChatMedia | null {
  try {
    const value = JSON.parse(content);
    return value?.__codeforge_media_v1 === true &&
      typeof value.path === 'string' &&
      typeof value.type === 'string'
      ? value as StoredChatMedia
      : null;
  } catch {
    return null;
  }
}

async function hydrateMessageMedia(message: ChatMessage): Promise<ChatMessage> {
  const media = parseStoredChatMedia(message.content);
  if (!media) return message;

  const { data, error } = await supabase.storage
    .from(media.bucket || CHAT_MEDIA_BUCKET)
    .createSignedUrl(media.path, SIGNED_URL_LIFETIME_SECONDS);

  if (error || !data?.signedUrl) {
    console.error('Could not create a signed chat-media URL:', error?.message);
    return {
      ...message,
      content: JSON.stringify({ ...media, url: null }),
    };
  }

  // The signed URL exists only in client state. The database keeps the storage path,
  // so refreshing the page creates a fresh URL without changing the saved message.
  return {
    ...message,
    content: JSON.stringify({ ...media, url: data.signedUrl }),
  };
}

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
  sendMediaMessage: (file: File) => Promise<{ error: string | null }>;
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
      const [messageResult, reactionResult, editResult] = await Promise.all([
        supabase.from('messages').select('*').order('created_at', { ascending: true }),
        supabase.from('message_reactions').select('*'),
        supabase.from('message_edits').select('*').order('created_at', { ascending: true }),
      ]);

      if (cancelled || !isMounted()) return;

      if (messageResult.error) {
        console.error('Failed to load messages:', messageResult.error.message);
        setMessages([]);
      } else {
        const hydratedMessages = await Promise.all(
          ((messageResult.data ?? []) as ChatMessage[]).map(hydrateMessageMedia),
        );
        if (!cancelled && isMounted()) setMessages(hydratedMessages);
      }

      if (reactionResult.error) {
        console.error('Failed to load reactions:', reactionResult.error.message);
      } else {
        setReactions((reactionResult.data ?? []) as MessageReaction[]);
      }

      if (editResult.error) {
        console.error('Failed to load edit history:', editResult.error.message);
      } else {
        setEdits((editResult.data ?? []) as MessageEdit[]);
      }
    };

    void load().catch((error) => {
      console.error('Unexpected error loading chat data:', error);
    });

    const channel = supabase
      .channel('terminal-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const row = payload.new as ChatMessage;
        void hydrateMessageMedia(row).then((hydratedRow) => {
          if (!isMounted()) return;
          setMessages((prev) => prev.some((m) => m.id === hydratedRow.id) ? prev : [...prev, hydratedRow]);
        }).catch((error) => console.error('Could not load newly received media:', error));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const row = payload.new as ChatMessage;
        void hydrateMessageMedia(row).then((hydratedRow) => {
          if (!isMounted()) return;
          setMessages((prev) => prev.map((m) => m.id === hydratedRow.id
            ? {
                ...m,
                is_pinned: hydratedRow.is_pinned,
                content: hydratedRow.content,
                recalled_at: hydratedRow.recalled_at,
                updated_at: hydratedRow.updated_at,
              }
            : m));
        }).catch((error) => console.error('Could not refresh updated message:', error));
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

  const getAuthenticatedUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    if (!user?.email) throw new Error('User email not found');
    return user;
  };

  const sendMessage = async (content: string): Promise<{ error: string | null }> => {
    if (!senderId) return { error: 'Not signed in' };

    try {
      const user = await getAuthenticatedUser();
      const { error } = await supabase.from('messages').insert({
        content,
        email: user.email,
      });
      return { error: error?.message ?? null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Could not send the message.' };
    }
  };

  const sendMediaMessage = async (file: File): Promise<{ error: string | null }> => {
    if (!senderId) return { error: 'Not signed in' };
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return { error: 'Only image and video files can use this media upload method.' };
    }

    let uploadedPath: string | null = null;

    try {
      const user = await getAuthenticatedUser();
      const safeFileName = (file.name || (file.type.startsWith('image/') ? 'image' : 'video'))
        .replace(/[^a-zA-Z0-9._()-]/g, '_')
        .slice(-120);
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(CHAT_MEDIA_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) return { error: `Media upload failed: ${uploadError.message}` };
      uploadedPath = path;

      const metadata: StoredChatMedia = {
        __codeforge_media_v1: true,
        bucket: CHAT_MEDIA_BUCKET,
        path,
        name: file.name || safeFileName,
        type: file.type,
        size: file.size,
      };

      const { error: insertError } = await supabase.from('messages').insert({
        content: JSON.stringify(metadata),
        email: user.email,
      });

      if (insertError) {
        // Avoid leaving orphaned storage files when the message row cannot be created.
        const { error: cleanupError } = await supabase.storage.from(CHAT_MEDIA_BUCKET).remove([path]);
        if (cleanupError) console.error('Could not remove orphaned chat media:', cleanupError.message);
        return { error: `File uploaded, but the chat message could not be saved: ${insertError.message}` };
      }

      return { error: null };
    } catch (error) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage.from(CHAT_MEDIA_BUCKET).remove([uploadedPath]);
        if (cleanupError) console.error('Could not clean up failed media upload:', cleanupError.message);
      }
      return { error: error instanceof Error ? error.message : 'Could not upload this media file.' };
    }
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

  return {
    messages,
    reactions,
    edits,
    connected,
    sendMessage,
    sendMediaMessage,
    toggleReaction,
    togglePin,
    deleteMessage,
    editMessage,
    recallMessage,
  };
}
