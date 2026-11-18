import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Circle, Pin, Settings, X } from 'lucide-react';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import type { ChatMessage } from '../types';

interface CommandTerminalChatProps {
  userId: string;
  onBack: () => void;
}

interface TerminalPalette {
  background: string;
  ownText: string;
  otherText: string;
  mutedText: string;
}

const DEFAULT_PALETTE: TerminalPalette = {
  background: '#087A3D',
  ownText: '#A9E5FF',
  otherText: '#173B9C',
  mutedText: '#B9E8CF',
};

export default function CommandTerminalChat({ userId, onBack }: CommandTerminalChatProps) {
  const storageKey = `codeforge_terminal_palette_${userId}`;
  const [palette, setPalette] = useState<TerminalPalette>(() => {
    try {
      return { ...DEFAULT_PALETTE, ...JSON.parse(localStorage.getItem(storageKey) || '{}') };
    } catch {
      return DEFAULT_PALETTE;
    }
  });
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftPalette, setDraftPalette] = useState(palette);
  const [hiddenIds, setHiddenIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(`secret_chat_hidden_${userId}`) || '[]'); }
    catch { return []; }
  });
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const mountedRef = useRef(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, connected, sendMessage, togglePin, deleteMessage } =
    useRealtimeMessages(userId, () => mountedRef.current);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(palette));
  }, [palette, storageKey]);

  useEffect(() => {
    localStorage.setItem(`secret_chat_hidden_${userId}`, JSON.stringify(hiddenIds));
  }, [hiddenIds, userId]);

  const visible = useMemo(() => messages.filter((m) =>
    !hiddenIds.includes(m.id) && (!showPinnedOnly || m.is_pinned)
  ), [messages, hiddenIds, showPinnedOnly]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError(null);
    const { error } = await sendMessage(content);
    if (error) setSendError(error);
    else setDraft('');
    setSending(false);
    inputRef.current?.focus();
  };

  const sendAttachment = async (selected?: File) => {
    if (!selected) return;
    if (selected.size > 1 * 1024 * 1024) {
      setSendError('File size must be under 1 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const data = String(reader.result);
      let content = data;
      if (!selected.type.startsWith('image/') && !selected.type.startsWith('video/')) {
        content = JSON.stringify({ name: selected.name, size: selected.size, type: selected.type, data });
      }
      setSending(true);
      setSendError(null);
      const { error } = await sendMessage(content);
      if (error) setSendError(error);
      setSending(false);
    };
    reader.readAsDataURL(selected);
  };

  const savePalette = () => {
    setPalette(draftPalette);
    setSettingsOpen(false);
  };

  const time = (value: string) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const renderContent = (message: ChatMessage) => {
    if (message.content.startsWith('data:image')) {
      return <button type="button" onClick={() => setPreviewImage(message.content)} className="block text-left underline">[IMAGE: open attachment]</button>;
    }
    if (message.content.startsWith('data:video')) {
      return <video src={message.content} controls className="mt-1 max-h-64 max-w-full" />;
    }
    if (message.content.startsWith('{')) {
      try {
        const payload = JSON.parse(message.content);
        if (payload.data && payload.name) {
          return <a href={payload.data} download={payload.name} className="underline">[FILE: {payload.name}]</a>;
        }
      } catch { /* regular text */ }
    }
    return <span className="whitespace-pre-wrap break-words">{message.content}</span>;
  };

  return (
    <main className="fixed inset-0 z-[60] flex flex-col font-mono" style={{ backgroundColor: palette.background, color: palette.ownText }}>
      <header className="flex min-h-11 items-center justify-between border-b border-black/30 bg-black/20 px-3 sm:px-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 mr-2" aria-hidden="true">
            <Circle size={9} fill="#ff5f57" color="#ff5f57" />
            <Circle size={9} fill="#febc2e" color="#febc2e" />
            <Circle size={9} fill="#28c840" color="#28c840" />
          </div>
          <span>Command Prompt — C:\CodeForge\Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[10px]" style={{ color: palette.mutedText }}>
            {connected ? 'CONNECTED' : 'CONNECTING'}
          </span>
          <button type="button" onClick={() => { setDraftPalette(palette); setSettingsOpen(true); }} title="Terminal colors" className="p-1.5 hover:bg-black/20">
            <Settings size={15} />
          </button>
          <button type="button" onClick={onBack} title="Exit terminal" className="p-1.5 hover:bg-black/20">
            <X size={16} />
          </button>
        </div>
      </header>

      <section ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5 text-sm leading-6">
        <div style={{ color: palette.mutedText }}>
          Microsoft Windows [Version 10.0.22631.0]<br />
          (c) CodeForge. All rights reserved.<br /><br />
          C:\CodeForge\Terminal&gt; connect --secure<br />
          {connected ? '[OK] Secure channel connected.' : '[..] Establishing secure channel...'}<br />
          [OK] Shared message stream loaded.<br /><br />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-4 text-xs" style={{ color: palette.mutedText }}>
          <button type="button" onClick={() => setShowPinnedOnly(v => !v)} className="underline">
            {showPinnedOnly ? 'show all messages' : 'show pinned messages'}
          </button>
          <span>{visible.length} message(s)</span>
        </div>

        {visible.length === 0 && (
          <p style={{ color: palette.mutedText }}>No messages found. Type below to start the conversation.</p>
        )}

        <div className="space-y-3">
          {visible.map((message) => {
            const own = message.sender_id === userId;
            return (
              <article key={message.id} className="group">
                <div className="flex flex-wrap items-start gap-x-2">
                  <span style={{ color: palette.mutedText }}>[{time(message.created_at)}]</span>
                  <span style={{ color: own ? palette.ownText : palette.otherText }}>
                    {renderContent(message)}
                  </span>
                  {message.is_pinned && <Pin size={12} className="mt-1 shrink-0" />}
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-[10px] opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100" style={{ color: palette.mutedText }}>
                  <button type="button" onClick={() => togglePin(message)} className="underline">{message.is_pinned ? 'UNPIN' : 'PIN'}</button>
                  {own && <button type="button" onClick={() => deleteMessage(message.id)} className="underline">RECALL</button>}
                  <button type="button" onClick={() => setHiddenIds(ids => [...ids, message.id])} className="underline">DELETE FOR ME</button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-5" style={{ color: palette.mutedText }}>C:\CodeForge\Terminal&gt;</div>
      </section>

      <footer className="border-t border-black/30 bg-black/15 p-3 sm:px-6">
        {sendError && <p role="alert" className="mb-2 text-xs text-red-100">{sendError}</p>}
        <form onSubmit={submit} className="flex items-center gap-2">
          <span className="shrink-0 text-xs sm:text-sm" style={{ color: palette.mutedText }}>C:\&gt;</span>
          <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} autoComplete="off" maxLength={2000}
            placeholder="Type a message..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-60"
            onKeyDown={e => { if (e.key === 'Escape') onBack(); }}
            style={{ color: palette.ownText }} />
          <label className="cursor-pointer px-2 py-1 text-xs underline" title="Attach a file">
            ATTACH
            <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.zip" className="hidden" onChange={e => { void sendAttachment(e.target.files?.[0]); e.currentTarget.value = ''; }} />
          </label>
          <button type="submit" disabled={sending || !draft.trim()} className="px-2 py-1 text-xs underline disabled:opacity-40">
            {sending ? 'SENDING...' : 'SEND'}
          </button>
        </form>
        <div className="mt-1 text-[10px]" style={{ color: palette.mutedText }}>ENTER: SEND · HOVER A MESSAGE: ACTIONS · ESC: EXIT</div>
      </footer>

      {settingsOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <section className="w-full max-w-md border border-white/30 bg-[#071b12] p-4 text-sm text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">TERMINAL DISPLAY SETTINGS</h2>
              <button type="button" onClick={() => setSettingsOpen(false)}><X size={16} /></button>
            </div>
            <p className="mb-4 text-xs text-white/70">These preferences are saved only in this browser. Each person can customize their own display.</p>
            <div className="space-y-4">
              {([
                ['background', 'Terminal background'],
                ['ownText', 'Your message text'],
                ['otherText', 'Other person’s message text'],
                ['mutedText', 'Prompt / timestamp text'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-3">
                  <span>{label}</span>
                  <input type="color" value={draftPalette[key]} onChange={e => setDraftPalette(p => ({ ...p, [key]: e.target.value }))} className="h-8 w-12 cursor-pointer bg-transparent" />
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDraftPalette(DEFAULT_PALETTE)} className="px-3 py-2 text-xs underline">RESET DEFAULT</button>
              <button type="button" onClick={() => setSettingsOpen(false)} className="px-3 py-2 text-xs underline">CANCEL</button>
              <button type="button" onClick={savePalette} className="flex items-center gap-1 bg-white px-3 py-2 text-xs font-bold text-black"><Check size={13} /> SAVE</button>
            </div>
          </section>
        </div>
      )}

      {previewImage && (
        <button type="button" onClick={() => setPreviewImage(null)} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4">
          <img src={previewImage} alt="Attachment preview" className="max-h-full max-w-full object-contain" />
        </button>
      )}
    </main>
  );
}
