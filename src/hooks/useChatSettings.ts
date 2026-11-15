import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export interface ChatSettings {
  title: string;
  avatar_url: string | null;
}

const DEFAULT_SETTINGS: ChatSettings = {
  title: 'Secret Sanctuary',
  avatar_url: null,
};

export function useChatSettings() {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from('chat_settings')
      .select('title, avatar_url')
      .eq('id', 'main')
      .maybeSingle();

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    if (data) {
      setSettings({
        title: data.title ?? DEFAULT_SETTINGS.title,
        avatar_url: data.avatar_url ?? null,
      });
    } else {
      setSettings(DEFAULT_SETTINGS);
    }

    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSettings();

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
          if (payload.eventType === 'DELETE') {
            setSettings(DEFAULT_SETTINGS);
            return;
          }

          const row = payload.new as Partial<ChatSettings>;
          setSettings({
            title: row.title ?? DEFAULT_SETTINGS.title,
            avatar_url: row.avatar_url ?? null,
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadSettings]);

  const saveSharedSettings = useCallback(
    async (title: string, avatarUrl: string | null) => {
      const cleanTitle = title.trim();
      if (!cleanTitle) {
        throw new Error('Chat name cannot be empty.');
      }

      const { error: saveError } = await supabase
        .from('chat_settings')
        .upsert(
          {
            id: 'main',
            title: cleanTitle,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        );

      if (saveError) throw saveError;

      setSettings({ title: cleanTitle, avatar_url: avatarUrl });
    },
    [],
  );

  const uploadSharedAvatar = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please choose an image file.');
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
    const filePath = `shared/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('chat-avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }, []);

  return {
    settings,
    loading,
    error,
    saveSharedSettings,
    uploadSharedAvatar,
    refreshSettings: loadSettings,
  };
}
