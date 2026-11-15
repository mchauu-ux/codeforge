import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export interface ChatSettings {
  id: string;
  title: string;
  avatar_url: string | null;
  updated_at: string;
}

const DEFAULT_SETTINGS: ChatSettings = {
  id: 'main',
  title: 'Secret Sanctuary',
  avatar_url: null,
  updated_at: '',
};

export function useChatSettings() {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('chat_settings')
        .select('*')
        .eq('id', 'main')
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('Failed to load chat settings:', error.message);
      } else if (data) {
        setSettings(data as ChatSettings);
      }

      setLoading(false);
    };

    loadSettings();

    const channel = supabase
      .channel('shared-chat-settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_settings',
          filter: 'id=eq.main',
        },
        (payload) => {
          if (payload.new && Object.keys(payload.new).length > 0) {
            setSettings(payload.new as ChatSettings);
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const saveSharedSettings = async (
    title: string,
    avatarUrl: string | null,
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('chat_settings')
      .upsert(
        {
          id: 'main',
          title,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

    return { error: error?.message ?? null };
  };

  const uploadSharedAvatar = async (
    file: File,
  ): Promise<{ url: string | null; error: string | null }> => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `shared/avatar-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from('chat-avatars')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    const { data } = supabase.storage
      .from('chat-avatars')
      .getPublicUrl(path);

    return { url: data.publicUrl, error: null };
  };

  return {
    settings,
    loading,
    saveSharedSettings,
    uploadSharedAvatar,
  };
}