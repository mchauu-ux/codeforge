import React, { useState, useEffect, useRef } from 'react';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages'; // Adjust path if needed

interface ShadowKernelModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export function ShadowKernelModal({ isOpen, onClose, userId }: ShadowKernelModalProps) {
  const isMountedRef = useRef(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Connects to the exact same Supabase 'messages' table & Realtime channel
  const { messages, connected, sendMessage, togglePin, deleteMessage } = useRealtimeMessages(
    userId,
    () => isMountedRef.current
  );

  // Auto-scroll to bottom on new synced messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    // Local utility commands
    if (trimmed === '/exit' || trimmed === '/quit') {
      setInput('');
      onClose();
      return;
    }

    setSending(true);
    setErrorMsg(null);
    const { error } = await sendMessage(trimmed);
    setSending(false);

    if (error) {
      setErrorMsg(`ERR_TX_FAILED: ${error}`);
    } else {
      setInput('');
    }
  };

  const pinnedMessages = messages.filter((m) => m.is_pinned);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono text-xs sm:text-sm">
      {/* Main Cyber-Deck Frame */}
      <div className="w-full max-w-5xl h-[85vh] bg-[#07090d] border border-amber-500/40 rounded-md shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col overflow-hidden text-amber-100">
        
        {/* Top Telemetry Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1117] border-b border-amber-500/30 select-none">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <button
                onClick={onClose}
                title="Terminate Session"
                className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition"
              />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-amber-400 font-bold tracking-wider">
              KERNEL_DEBUGGER // TTY2 [SHADOW_LINK]
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden sm:inline text-slate-400">
              MEM: <span className="text-amber-300">64.0GB</span> | PROTO: <span className="text-amber-300">WSS</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className={connected ? 'text-emerald-400' : 'text-red-400'}>
                {connected ? 'BRIDGE_SYNCED' : 'OFFLINE'}
              </span>
            </span>
            <button
              onClick={onClose}
              className="px-2 py-0.5 border border-amber-500/40 rounded text-amber-300 hover:bg-amber-500/20 transition"
            >
              [ESC]
            </button>
          </div>
        </div>

        {/* Split Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Diagnostics & Pinned Directives Sidebar */}
          <div className="hidden md:flex w-64 flex-col border-r border-amber-500/20 bg-[#090c12] p-3 justify-between">
            <div className="space-y-4 overflow-y-auto">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-amber-500/70 mb-1.5">
                  // Active Session
                </div>
                <div className="p-2 rounded bg-black/50 border border-amber-500/20 text-[11px] space-y-1">
                  <div className="text-slate-400">UID_HASH:</div>
                  <div className="text-amber-300 truncate">{userId || 'UNAUTHENTICATED'}</div>
                  <div className="text-emerald-400 text-[10px] pt-1">● DUAL-TERMINAL SYNC ON</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-amber-500/70 mb-1.5">
                  // Pinned Directives ({pinnedMessages.length})
                </div>
                {pinnedMessages.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic">No pinned packets.</div>
                ) : (
                  <div className="space-y-2">
                    {pinnedMessages.map((pm) => (
                      <div
                        key={pm.id}
                        className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 break-words"
                      >
                        {pm.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 border-t border-amber-500/10 pt-2">
              Type <span className="text-amber-400">/exit</span> to detach TTY2.
            </div>
          </div>

          {/* Right Live Packet Stream */}
          <div className="flex-1 flex flex-col bg-[#06080b] relative">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-amber-500/60 text-xs pb-2 border-b border-amber-500/10">
                *** ESTABLISHED ENCRYPTED STREAM WITH PRIMARY SANCTUARY ***
              </div>

              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === userId;
                const timeStr = new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                const hexIndex = `0x${(idx + 1).toString(16).padStart(3, '0').toUpperCase()}`;

                return (
                  <div
                    key={msg.id}
                    className={`group flex flex-col p-2.5 rounded border transition ${
                      isMe
                        ? 'bg-amber-500/5 border-amber-500/25 ml-6'
                        : 'bg-cyan-950/20 border-cyan-500/25 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{hexIndex}</span>
                        <span
                          className={`font-bold ${
                            isMe ? 'text-amber-400' : 'text-cyan-400'
                          }`}
                        >
                          {isMe ? '[LOCAL_NODE]' : '[REMOTE_PEER]'}
                        </span>
                        <span className="text-slate-500">{timeStr}</span>
                        {msg.is_pinned && (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[10px]">
                            PINNED
                          </span>
                        )}
                      </div>

                      {/* Hover Actions (Syncs pins/deletes across both UIs) */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition">
                        <button
                          onClick={() => togglePin(msg)}
                          className="text-slate-400 hover:text-amber-300 text-[10px]"
                        >
                          {msg.is_pinned ? '[UNPIN]' : '[PIN]'}
                        </button>
                        {isMe && (
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="text-slate-400 hover:text-red-400 text-[10px]"
                          >
                            [DROP]
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-100 whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Banner if RLS or Network fails */}
            {errorMsg && (
              <div className="px-4 py-1.5 bg-red-950/80 border-t border-red-500/50 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Command Line Input */}
            <form
              onSubmit={handleCommandSubmit}
              className="p-3 bg-[#0b0f17] border-t border-amber-500/30 flex items-center gap-2"
            >
              <span className="text-amber-400 font-bold select-none">root@tty2:~#</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Inject payload into shared stream..."
                className="flex-1 bg-transparent text-amber-100 placeholder-slate-600 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-40 border border-amber-500/50 text-amber-300 font-bold rounded text-xs transition"
              >
                {sending ? 'TX...' : 'EXEC'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}