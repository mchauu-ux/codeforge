import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Pin, PinOff, Trash2, Loader2, ArrowLeft, ChevronDown, Sparkles, Heart, Palette, CheckSquare, Square, Image as ImageIcon, FileText, Download, Eye, Settings, X, Globe, Smile, Upload, RotateCcw } from 'lucide-react';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { useChatSettings } from '../hooks/useChatSettings';

interface TerminalChatProps {
  userId: string;
  onBack: () => void;
}

type ThemeKey = 'cozy' | 'cyber' | 'matcha' | 'sakura';
type LangKey = 'en' | 'vi' | 'ja' | 'ko' | 'fr' | 'es';
const STICKERS = [
  { id: '1', name: 'Happy Bunny', symbol: '(๑>◡<๑)' },
  { id: '2', name: 'Shy Blushing', symbol: '(*/ω＼*)' },
  { id: '3', name: 'Sparkle Heart', symbol: '💖✨' },
  { id: '4', name: 'Strawberry', symbol: '🍓' },
  { id: '5', name: 'Teddy Bear', symbol: '🧸' },
  { id: '6', name: 'Sweet Dango', symbol: '🍡' },
  { id: '7', name: 'Crying Cat', symbol: '(╥﹏╥)' },
  { id: '8', name: 'Kawaii Cat', symbol: '(=^･ω･^=)' },
  { id: '9', name: 'Starry Eyed', symbol: '(☆ω☆)' },
  { id: '10', name: 'Sending Love', symbol: '💌ʕ•ᴥ•ʔ' },
  { id: '11', name: 'Sleepy Zzz', symbol: '(ᴗ˳ᴗ)' },
  { id: '12', name: 'Chibi Hug', symbol: '(づ￣ ³￣)づ' },
  { id: '13', name: 'Star Magic', symbol: '🌟🪄' },
  { id: '14', name: 'Boba Tea', symbol: '🧋✨' },
  { id: '15', name: 'Sakura Petal', symbol: '🌸🍃' },
  { id: '16', name: 'Cat Paws', symbol: '🐾💖' },
];

const TRANSLATIONS: Record<LangKey, Record<string, string>> = {
  en: {
    back: 'Back to Academy',
    title: 'Secret Sanctuary',
    live: 'Live Connected',
    connecting: 'Connecting...',
    pinnedNotes: 'Pinned Notes',
    secureActive: '🌺💐🌺🌷🌸🪻🌻🌹🥀🌼💮🎴⏳',
    quietHere: "It's quiet here...",
    sendFirst: 'Send your first message, photo, video, or file below! 💌',
    selectToDelete: 'Select to Delete',
    cancelSelect: 'Cancel Select',
    deleteForMe: 'Delete For Me',
    recall: 'Recall Message',
    selected: 'selected',
    filterPinned: 'Filter Pinned',
    showingPinned: 'Showing Pinned Only',
    pressEnter: 'Press Enter to send 💌',
    placeholder: 'Type a cute message or attach a file...',
    settings: 'Settings',
    language: 'Language',
    chatName: 'Chat name',
    selectTheme: 'Select Theme',
    readDoc: 'Read document',
    downloadFile: 'Download file',
    clickToView: 'Click to view full size',
    stickersTitle: 'Kawaii Stickers ✨',
    searchStickers: 'Search stickers...',
  },
  vi: {
    back: 'Quay lại Học viện',
    title: 'Nơi Trú Ẩn Bí Mật',
    live: 'Đã kết nối',
    connecting: 'Đang kết nối...',
    pinnedNotes: 'Ghi chú đã ghim',
    secureActive: '🌺💐🌺🌷🌸🪻🌻🌹🥀🌼💮🎴⏳',
    quietHere: 'Ở đây yên tĩnh quá...',
    sendFirst: 'Gửi tin nhắn, ảnh, video hoặc tệp đầu tiên của bạn ở dưới nhé! 💌',
    selectToDelete: 'Chọn để xóa',
    cancelSelect: 'Hủy chọn',
    deleteForMe: 'Xóa đối với tôi',
    recall: 'Thu hồi tin nhắn',
    selected: 'đã chọn',
    filterPinned: 'Lọc ghim',
    showingPinned: 'Hiển thị mục đã ghim',
    pressEnter: 'Nhấn Enter để gửi 💌',
    placeholder: 'Nhập tin nhắn dễ thương hoặc đính kèm tệp...',
    settings: 'Cài đặt',
    language: 'Ngôn ngữ',
    chatName: 'Tên cuộc trò chuyện',
    selectTheme: 'Chọn Chủ đề',
    readDoc: 'Đọc tài liệu',
    downloadFile: 'Tải xuống',
    clickToView: 'Nhấp để xem kích thước đầy đủ',
    stickersTitle: 'Nhãn dán dễ thương ✨',
    searchStickers: 'Tìm kiếm nhãn dán...',
  },
  ja: {
    back: 'アカデミーに戻る',
    title: 'シークレット・サンクチュアリ',
    live: '接続済み',
    connecting: '接続中...',
    pinnedNotes: 'ピン留めされたメモ',
    secureActive: '🌺💐🌺🌷🌸🪻🌻🌹🥀🌼💮🎴⏳',
    quietHere: 'ここは静かです...',
    sendFirst: '最初のメッセージ、写真、動画、ファイルを送信してください！ 💌',
    selectToDelete: '選択して削除',
    cancelSelect: '選択を解除',
    deleteForMe: '自分のみ削除',
    recall: 'メッセージを取り消す',
    selected: '選択中',
    filterPinned: 'ピン留めをフィルター',
    showingPinned: 'ピン留めのみ表示',
    pressEnter: 'Enterキーで送信 💌',
    placeholder: 'メッセージやファイルを送信...',
    settings: '設定',
    language: '言語',
    chatName: 'チャット名',
    selectTheme: 'テーマを選択',
    readDoc: 'ドキュメントを読む',
    downloadFile: 'ファイルをダウンロード',
    clickToView: 'クリックして拡大',
    stickersTitle: '可愛いステッカー ✨',
    searchStickers: 'ステッカーを検索...',
  },
  ko: {
    back: '아카데미로 돌아가기',
    title: '시크릿 생추어리',
    live: '실시간 연결됨',
    connecting: '연결 중...',
    pinnedNotes: '고정된 노트',
    secureActive: '🌺💐🌺🌷🌸🪻🌻🌹🥀🌼💮🎴⏳',
    quietHere: '여용 조용합니다...',
    sendFirst: '첫 메시지, 사진, 동영상 또는 파일을 보내보세요! 💌',
    selectToDelete: '선택하여 삭제',
    cancelSelect: '선택 취소',
    deleteForMe: '나에게서만 삭제',
    recall: '메시지 회수',
    selected: '개 선택됨',
    filterPinned: '고정 필터',
    showingPinned: '고정된 항목만 표시',
    pressEnter: 'Enter를 눌러 전송 💌',
    placeholder: '메시지 또는 파일 입력...',
    settings: '설정',
    language: '언어',
    chatName: '채팅 이름',
    selectTheme: '테마 선택',
    readDoc: '문서 읽기',
    downloadFile: '파일 다운로드',
    clickToView: '클릭하여 크게 보기',
    stickersTitle: '귀여운 스티커 ✨',
    searchStickers: '스티커 검색...',
  },
    fr: {
    back: 'Retour à l’Académie',
    title: 'Sanctuaire Secret',
    live: 'Connecté',
    connecting: 'Connexion...',
    pinnedNotes: 'Notes épinglées',
    secureActive: '🌺💐🌺🌷🌸🪻🌻🌹🥀🌼💮🎴⏳',
    quietHere: 'C’est si calme ici...',
    sendFirst: 'Envoyez votre premier message, photo, vidéo ou fichier ci-dessous ! 💌',
    selectToDelete: 'Sélectionner pour supprimer',
    cancelSelect: 'Annuler la sélection',
    deleteForMe: 'Supprimer pour moi',
    recall: 'Rappeler le message',
    selected: 'sélectionné(s)',
    filterPinned: 'Filtrer les éléments épinglés',
    showingPinned: 'Affichage des éléments épinglés uniquement',
    pressEnter: 'Appuyez sur Entrée pour envoyer 💌',
    placeholder: 'Écrivez un joli message ou joignez un fichier...',
    settings: 'Paramètres',
    language: 'Langue',
    chatName: 'Nom de la conversation',
    selectTheme: 'Choisir un thème',
    readDoc: 'Lire le document',
    downloadFile: 'Télécharger le fichier',
    clickToView: 'Cliquer pour voir en taille réelle',
    stickersTitle: 'Autocollants Kawaii ✨',
    searchStickers: 'Rechercher des autocollants...',
  },
  es: {
    back: 'Volver a la Academia',
    title: 'Santuario Secreto',
    live: 'Conectado',
    connecting: 'Conectando...',
    pinnedNotes: 'Notas fijadas',
    secureActive: '🌺💐🌺🌷🌸🪻🌻🌹🥀🌼💮🎴⏳',
    quietHere: '¡Qué tranquilo está todo aquí!',
    sendFirst: '¡Envía tu primer mensaje, foto, vídeo o archivo aquí abajo! 💌',
    selectToDelete: 'Seleccionar para eliminar',
    cancelSelect: 'Cancelar selección',
    deleteForMe: 'Eliminar para mí',
    recall: 'Retirar mensaje',
    selected: 'seleccionado(s)',
    filterPinned: 'Filtrar elementos fijados',
    showingPinned: 'Mostrando solo elementos fijados',
    pressEnter: 'Pulsa Enter para enviar 💌',
    placeholder: 'Escribe un mensaje bonito o adjunta un archivo...',
    settings: 'Configuración',
    language: 'Idioma',
    chatName: 'Nombre del chat',
    selectTheme: 'Seleccionar tema',
    readDoc: 'Leer documento',
    downloadFile: 'Descargar archivo',
    clickToView: 'Haz clic para ver en tamaño completo',
    stickersTitle: 'Pegatinas Kawaii ✨',
    searchStickers: 'Buscar pegatinas...',
  },
};

const THEMES: Record<
  ThemeKey,
  {
    name: string;
    bg: string;
    headerBg: string;
    inputBg: string;
    bubbleOwn: string;
    bubbleOther: string;
    text: string;
    accent: string;
    border: string;
  }
> = {
  cozy: {
    name: 'Cozy Lavender ✨',
    bg: 'bg-[#121118]',
    headerBg: 'bg-[#181622]/80',
    inputBg: 'bg-[#121118]',
    bubbleOwn: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-purple-500/10',
    bubbleOther: 'bg-[#1e1a2e] text-purple-100 border border-purple-500/20',
    text: 'text-pink-50',
    accent: 'text-purple-400',
    border: 'border-purple-500/15',
  },
  cyber: {
    name: 'Cyber Blue ⚡',
    bg: 'bg-slate-950',
    headerBg: 'bg-slate-900/80',
    inputBg: 'bg-slate-950',
    bubbleOwn: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-blue-500/10',
    bubbleOther: 'bg-slate-900 text-blue-100 border border-blue-500/20',
    text: 'text-slate-100',
    accent: 'text-cyan-400',
    border: 'border-blue-500/15',
  },
  matcha: {
    name: 'Matcha Latte 🍵',
    bg: 'bg-[#161c18]',
    headerBg: 'bg-[#1c241f]/80',
    inputBg: 'bg-[#161c18]',
    bubbleOwn: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/10',
    bubbleOther: 'bg-[#212b23] text-emerald-100 border border-emerald-500/20',
    text: 'text-emerald-50',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/15',
  },
  sakura: {
    name: 'Sakura Blossom 🌸',
    bg: 'bg-[#1f1519]',
    headerBg: 'bg-[#261c22]/80',
    inputBg: 'bg-[#1f1519]',
    bubbleOwn: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-500/10',
    bubbleOther: 'bg-[#2e1f26] text-rose-100 border border-rose-500/20',
    text: 'text-rose-50',
    accent: 'text-rose-400',
    border: 'border-rose-500/15',
  },
};

export default function TerminalChat({ userId, onBack }: TerminalChatProps) {
  // Shared settings synchronize through Supabase; personal overrides stay on this device.
  const { settings: sharedSettings, saveSharedSettings, uploadSharedAvatar } = useChatSettings();
  const localTitleKey = `secret_chat_title_${userId}`;
  const localAvatarKey = `secret_chat_avatar_${userId}`;
  const titleModeKey = `secret_chat_title_mode_${userId}`;
  const avatarModeKey = `secret_chat_avatar_mode_${userId}`;

  const [localTitle, setLocalTitle] = useState(() => localStorage.getItem(localTitleKey) || 'Secret Sanctuary');
  const [localAvatar, setLocalAvatar] = useState<string | null>(() => localStorage.getItem(localAvatarKey));
  const [titleMode, setTitleMode] = useState<'local' | 'shared'>(() => (localStorage.getItem(titleModeKey) as 'local' | 'shared') || 'local');
  const [avatarMode, setAvatarMode] = useState<'local' | 'shared'>(() => (localStorage.getItem(avatarModeKey) as 'local' | 'shared') || 'local');
  const chatTitle = titleMode === 'shared' ? sharedSettings.title : localTitle;
  const chatAvatar = avatarMode === 'shared' ? sharedSettings.avatar_url : localAvatar;

  const [settingsTitleDraft, setSettingsTitleDraft] = useState(localTitle);
  const [settingsTitleMode, setSettingsTitleMode] = useState<'local' | 'shared'>(titleMode);
  const [settingsAvatarMode, setSettingsAvatarMode] = useState<'local' | 'shared'>(avatarMode);
  const [settingsAvatarDraft, setSettingsAvatarDraft] = useState<string | null>(localAvatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const openSettings = () => {
    setSettingsTitleDraft(titleMode === 'shared' ? sharedSettings.title : localTitle);
    setSettingsTitleMode(titleMode);
    setSettingsAvatarMode(avatarMode);
    setSettingsAvatarDraft(avatarMode === 'shared' ? sharedSettings.avatar_url : localAvatar);
    setAvatarFile(null);
    setSettingsError(null);
    setShowSettings(true);
  };

  const handleAvatarChoose = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSettingsError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSettingsError('Avatar image must be smaller than 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSettingsAvatarDraft(String(reader.result));
      setAvatarFile(file);
      setSettingsError(null);
    };
    reader.onerror = () => setSettingsError('Could not read this image.');
    reader.readAsDataURL(file);
  };

  
const handleSaveSettings = async () => {
  const title = settingsTitleDraft.trim() || 'Secret Sanctuary';

  setSavingSettings(true);
  setSettingsError(null);

  try {
    let sharedTitle = sharedSettings.title || 'Secret Sanctuary';
    let sharedAvatar = sharedSettings.avatar_url;

    // Update shared chat name
    if (settingsTitleMode === 'shared') {
      sharedTitle = title;
    }

    // Upload shared avatar if a new image was selected
    if (settingsAvatarMode === 'shared' && avatarFile) {
      const uploadedUrl = await uploadSharedAvatar(avatarFile);
      sharedAvatar = uploadedUrl;
    } else if (settingsAvatarMode === 'shared') {
      sharedAvatar = settingsAvatarDraft;
    }

    // Save shared settings to Supabase
    if (
      settingsTitleMode === 'shared' ||
      settingsAvatarMode === 'shared'
    ) {
      await saveSharedSettings(sharedTitle, sharedAvatar);
    }

    // Save personal chat name
    if (settingsTitleMode === 'local') {
      localStorage.setItem(localTitleKey, title);
      setLocalTitle(title);
    }

    // Save personal avatar
    if (settingsAvatarMode === 'local') {
      if (settingsAvatarDraft) {
        localStorage.setItem(localAvatarKey, settingsAvatarDraft);
      } else {
        localStorage.removeItem(localAvatarKey);
      }

      setLocalAvatar(settingsAvatarDraft);
    }

    // Save selected modes
    localStorage.setItem(titleModeKey, settingsTitleMode);
    localStorage.setItem(avatarModeKey, settingsAvatarMode);

    setTitleMode(settingsTitleMode);
    setAvatarMode(settingsAvatarMode);

    setShowSettings(false);

  } catch (error) {
    console.error('Settings save error:', error);

    setSettingsError(
      error instanceof Error
        ? error.message
        : 'Could not save settings.'
    );
  } finally {
    setSavingSettings(false);
  }
};


  const { messages, connected, sendMessage, togglePin, deleteMessage } =
    useRealtimeMessages(userId, () => mountedRef.current);
  
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  // Modals state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ name: string; content: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [stickerQuery, setStickerQuery] = useState('');

  // Language state persisted in localStorage
  const [lang, setLang] = useState<LangKey>(() => {
    return (localStorage.getItem('secret_chat_lang') as LangKey) || 'en';
  });

  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;

  useEffect(() => {
    localStorage.setItem('secret_chat_lang', lang);
  }, [lang]);

  // Local-only deleted messages state
  const [hiddenIds, setHiddenIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('secret_chat_hidden_' + userId) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('secret_chat_hidden_' + userId, JSON.stringify(hiddenIds));
  }, [hiddenIds, userId]);

  // Batch delete / Multi-select mode state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Local Theme State persisted in localStorage
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    return (localStorage.getItem('secret_chat_theme') as ThemeKey) || 'cozy';
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const theme = THEMES[themeKey];

  useEffect(() => {
    localStorage.setItem('secret_chat_theme', themeKey);
  }, [themeKey]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const pinned = useMemo(() => messages.filter((m) => m.is_pinned && !hiddenIds.includes(m.id)), [messages, hiddenIds]);
  
  const visible = useMemo(() => {
    let list = messages.filter((m) => !hiddenIds.includes(m.id));
    if (showPinnedOnly) {
      list = list.filter((m) => m.is_pinned);
    }
    return list;
  }, [messages, hiddenIds, showPinnedOnly]);

  const filteredStickers = useMemo(() => {
    if (!stickerQuery.trim()) return STICKERS;
    const q = stickerQuery.toLowerCase();
    return STICKERS.filter((s) => s.name.toLowerCase().includes(q) || s.symbol.includes(q));
  }, [stickerQuery]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (atBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, atBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 40);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError(null);
    const { error } = await sendMessage(content);
    if (error) {
      setSendError(error);
    } else {
      setDraft('');
      setAtBottom(true);
    }
    setSending(false);
  };

  const handleSendSticker = async (symbol: string) => {
    if (sending) return;
    setSending(true);
    setSendError(null);
    const { error } = await sendMessage(symbol);
    if (error) setSendError(error);
    else {
      setAtBottom(true);
      setShowStickers(false);
    }
    setSending(false);
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setSendError('File size must be under 1MB for direct chat attachments.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;

          if (width > height && width > maxDim) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else if (height > maxDim) {
            width = (width * maxDim) / height;
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

          setSending(true);
          setSendError(null);
          const { error } = await sendMessage(compressedBase64);
          if (error) setSendError(error);
          else setAtBottom(true);
          setSending(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        };
        img.src = result;
      } else if (file.type.startsWith('video/')) {
        setSending(true);
        setSendError(null);
        const { error } = await sendMessage(result);
        if (error) setSendError(error);
        else setAtBottom(true);
        setSending(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const payload = JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type,
          data: result,
        });
        setSending(true);
        setSendError(null);
        const { error } = await sendMessage(payload);
        if (error) setSendError(error);
        else setAtBottom(true);
        setSending(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (previewImage) setPreviewImage(null);
      else if (previewDoc) setPreviewDoc(null);
      else if (showSettings) setShowSettings(false);
      else if (showStickers) setShowStickers(false);
      else if (selectMode) {
        setSelectMode(false);
        setSelectedIds([]);
      } else {
        onBack();
      }
    }
  };

  const toggleSelectMessage = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleLocalDelete = (id: string) => {
    setHiddenIds((prev) => [...prev, id]);
  };

  const handleRecall = async (id: string) => {
    await deleteMessage(id);
  };

  const handleBatchLocalDelete = () => {
    if (selectedIds.length === 0) return;
    setHiddenIds((prev) => [...prev, ...selectedIds]);
    setSelectedIds([]);
    setSelectMode(false);
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const readDocumentText = (name: string, dataUrl: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip'].includes(ext || '')) {
      return `📄 ${name}\n\nThis is a binary file format (PDF or Office Document).\n\nPlease click the Download button on the message card to open it on your device!`;
    }
    try {
      const base64 = dataUrl.split(',')[1];
      const binString = atob(base64);
      const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
      return new TextDecoder().decode(bytes);
    } catch {
      return 'Unable to decode text content for this file.';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${theme.bg} font-sans ${theme.text} transition-colors duration-300`}>
      {/* Header */}
      <header className={`flex items-center justify-between border-b ${theme.border} ${theme.headerBg} px-6 py-4 backdrop-blur-md shadow-lg relative z-20`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-full border border-current/20 bg-current/5 px-4 py-1.5 text-xs font-medium transition-all hover:bg-current/10 hover:scale-[1.02]"
          >
            <ArrowLeft size={14} />
            {t('back')}
          </button>
          <div className="flex items-center gap-2.5">
            {chatAvatar ? (
              <img src={chatAvatar} alt="Chat avatar" className="h-9 w-9 rounded-2xl object-cover border border-white/20 shadow-md" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white shadow-md">
                <Sparkles size={18} />
              </span>
            )}
            <div>
              <h1 className="text-sm font-bold tracking-wide">{chatTitle}</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Select Mode Toggle */}
          <button
            onClick={() => {
              setSelectMode((v) => !v);
              setSelectedIds([]);
            }}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-medium transition-all ${
              selectMode
                ? 'border-pink-500 bg-pink-500/20 text-white'
                : 'border-current/20 bg-current/5 hover:bg-current/10'
            }`}
          >
            <CheckSquare size={14} />
            <span>{selectMode ? t('cancelSelect') : t('selectToDelete')}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={openSettings}
            className="flex items-center gap-1.5 rounded-full border border-current/20 bg-current/5 px-3.5 py-1.5 font-medium transition-all hover:bg-current/10"
            title={t('settings')}
          >
            <Settings size={14} />
            <span className="hidden sm:inline">{t('settings')}</span>
          </button>

          {/* Theme Switcher Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-current/20 bg-current/5 px-3.5 py-1.5 font-medium transition-all hover:bg-current/10"
              title="Change Theme"
            >
              <Palette size={14} />
              <span className="hidden sm:inline">{theme.name}</span>
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-purple-500/20 bg-[#181622] p-2 shadow-2xl backdrop-blur-xl z-50">
                <div className="mb-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider opacity-50">
                  {t('selectTheme')}
                </div>
                {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setThemeKey(key);
                      setShowThemeMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                      themeKey === key
                        ? 'bg-purple-500/20 text-white font-bold'
                        : 'text-purple-200/70 hover:bg-purple-500/10 hover:text-white'
                    }`}
                  >
                    <span>{THEMES[key].name}</span>
                    {themeKey === key && <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-full bg-black/30 border border-current/15 px-3.5 py-1 shadow-inner">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            {connected ? t('live') : t('connecting')}
          </div>
        </div>
      </header>

      {/* Pinned Messages Banner */}
      {pinned.length > 0 && (
        <div className="border-b border-amber-400/20 bg-amber-500/10 px-6 py-2.5 text-xs text-amber-200 backdrop-blur-sm">
          <div className="mb-1 flex items-center gap-1.5 font-bold tracking-wide">
            <Pin size={13} className="text-amber-400 animate-bounce" />
            {t('pinnedNotes')} ({pinned.length})
          </div>
          {pinned.map((m) => {
            let desc = m.content;
            if (m.content.startsWith('data:image')) desc = '[Photo]';
            else if (m.content.startsWith('data:video')) desc = '[Video]';
            else if (m.content.startsWith('{')) {
              try {
                const parsed = JSON.parse(m.content);
                desc = `[Document: ${parsed.name}]`;
              } catch {
                desc = '[Document]';
              }
            }
            return (
              <div key={m.id} className="truncate pl-5 text-amber-100/80 italic">
                ✦ {desc}
              </div>
            );
          })}
        </div>
      )}

      {/* Chat Messages Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 pt-16 pb-6 space-y-4 bg-gradient-to-b from-transparent via-black/10 to-transparent"
      >
        <div className="text-center my-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-current/5 border border-current/10 px-4 py-1 text-[11px] opacity-80 shadow-sm">
            <Heart size={12} className="text-pink-400 fill-pink-400" />
            {t('secureActive')}
          </span>
        </div>

        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-current/10 border border-current/20 mb-3">
              <Sparkles size={28} className="animate-pulse" />
            </div>
            <p className="text-sm font-medium">{t('quietHere')}</p>
            <p className="text-xs opacity-80 mt-1">{t('sendFirst')}</p>
          </div>
        )}

        {visible.map((m) => {
     
          const own = m.sender_id === userId;
          const isSelected = selectedIds.includes(m.id);
          const isImage = m.content.startsWith('data:image');
          const isVideo = m.content.startsWith('data:video');
          
          let filePayload = null;
          try {
            if (m.content.startsWith('{')) {
              filePayload = JSON.parse(m.content);
            }
          } catch {}
          const isFileCard = filePayload && filePayload.data;

          return (
          <div
  key={m.id}
  className={`group flex items-center gap-3 px-2 ${
    own ? 'justify-end' : 'justify-start'
  }`}
>
              {selectMode && (
                <button
                  type="button"
                  onClick={() => toggleSelectMessage(m.id)}
                  className="text-pink-400 hover:text-pink-300 transition-colors shrink-0"
                >
                  {isSelected ? <CheckSquare size={18} className="fill-pink-500/20" /> : <Square size={18} className="opacity-60" />}
                </button>
              )}

              {/* Strict uniform fixed width container so all messages & docs share the exact same right boundary */}
<div className={`flex flex-col gap-1 w-fit min-w-0 max-w-[min(75vw,420px)] ${
  own ? 'items-end' : 'items-start'
}`}>
               <div className={`relative flex items-end w-fit max-w-full ${
  own ? 'justify-end' : 'justify-start'
}`}>
                  {/* Message / Media / File Item */}
                  <div
                    onClick={() => {
                      if (selectMode) toggleSelectMessage(m.id);
                    }}
                    className={`relative transition-all min-w-0 ${
  isImage || isVideo
    ? ''
    : isFileCard
    ? ''
    : `w-fit max-w-full rounded-2xl p-3.5 text-sm shadow-md ${
    own ? theme.bubbleOwn : theme.bubbleOther
      }own ? 'rounded-br-sm' : 'rounded-bl-sm' ${m.is_pinned ? 'ring-2 ring-amber-400/60' : ''}`
} ${selectMode ? 'cursor-pointer hover:opacity-90' : ''}`}
                  >
                    {isImage ? (
                      <img
                        src={m.content}
                        alt="Shared media"
                        onClick={() => setPreviewImage(m.content)}
                        className="rounded-3xl max-h-80 w-full object-cover cursor-pointer hover:opacity-95 transition-all shadow-lg border border-current/10"
                        title={t('clickToView')}
                      />
                    ) : isVideo ? (
                      <video
                        src={m.content}
                        controls
                        className="rounded-3xl max-h-80 w-full object-cover shadow-lg border border-current/10 bg-black/40"
                      />
                    ) : isFileCard ? (
                      <div className="flex items-center gap-2 rounded-2xl border border-current/20 bg-black/40 p-2.5 backdrop-blur-md shadow-lg w-full min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300">
                          <FileText size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold truncate text-current">{filePayload.name}</p>
                          <p className="text-[8px] opacity-60 uppercase truncate">
                            {filePayload.name.split('.').pop()} document
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setPreviewDoc({ name: filePayload.name, content: readDocumentText(filePayload.name, filePayload.data) })}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-current/10 hover:bg-current/20 transition-all text-current shadow-sm"
                            title={t('readDoc')}
                          >
                            <Eye size={12} />
                          </button>
                          <a
                            href={filePayload.data}
                            download={filePayload.name}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-current/10 hover:bg-current/20 transition-all text-current shadow-sm"
                            title={t('downloadFile')}
                          >
                            <Download size={12} />
                          </a>
                        </div>
                      </div>
                                       ) : (
                      <p className="min-w-0 px-1 leading-relaxed whitespace-pre-wrap break-words">
                        {m.content}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timestamp right underneath, perfectly aligned to the right edge */}
              <div className="flex items-center justify-end gap-1 text-[9px] opacity-50 w-full">
  <span>{formatDateTime(m.created_at)}</span>
  {m.is_pinned && (    <Pin size={9} className="text-amber-400 fill-amber-400 inline" />
)}
</div>
              </div>

              {/* Hover actions, always to the right of the bubble */}
              {!selectMode && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => togglePin(m)}
                    title={m.is_pinned ? 'Unpin' : 'Pin'}
                    className="rounded-xl p-2 bg-black/40 border border-current/20 opacity-70 hover:opacity-100 hover:text-amber-300 transition-colors shadow-sm"
                  >
                    {m.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}
                  </button>
                  {own && (
                    <button
                      onClick={() => handleRecall(m.id)}
                      title={t('recall')}
                      className="rounded-xl p-2 bg-black/40 border border-current/20 opacity-70 hover:opacity-100 hover:text-sky-300 transition-colors shadow-sm"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => handleLocalDelete(m.id)}
                    title={t('deleteForMe')}
                    className="rounded-xl p-2 bg-black/40 border border-current/20 opacity-70 hover:opacity-100 hover:text-rose-400 transition-colors shadow-sm"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stickers Tab Modal */}
      {showStickers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-md animate-fadeIn">
          <div className="flex flex-col h-[75vh] w-full max-w-md rounded-3xl border border-purple-500/30 bg-[#181622] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-purple-500/20 px-6 py-4 bg-purple-950/40">
              <div className="flex items-center gap-2.5">
                <Smile size={20} className="text-pink-400" />
                <h2 className="text-sm font-bold text-white">{t('stickersTitle')}</h2>
              </div>
              <button
                onClick={() => setShowStickers(false)}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Bar for Stickers */}
            <div className="p-4 border-b border-purple-500/15 bg-black/20">
              <input
                type="text"
                value={stickerQuery}
                onChange={(e) => setStickerQuery(e.target.value)}
                placeholder={t('searchStickers')}
                className="w-full rounded-2xl border border-purple-500/30 bg-[#121118] px-4 py-2.5 text-xs text-white outline-none placeholder:opacity-40 focus:border-pink-500 shadow-inner"
                autoFocus
              />
            </div>

            {/* Sticker Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
              {filteredStickers.length === 0 ? (
                <div className="col-span-2 text-center opacity-40 py-12 text-xs">
                  No stickers found ✨
                </div>
              ) : (
                filteredStickers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSendSticker(s.symbol)}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4 transition-all hover:bg-pink-500/20 hover:border-pink-500 hover:scale-105 shadow-sm group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{s.symbol}</span>
                    <span className="text-[10px] font-medium text-purple-200/80 truncate w-full text-center">{s.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="flex flex-col w-full max-w-md max-h-[90vh] rounded-3xl border border-purple-500/30 bg-[#181622] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-purple-500/20 px-6 py-4 bg-purple-950/40">
              <div className="flex items-center gap-2.5">
                <Settings size={20} className="text-pink-400" />
                <h2 className="text-sm font-bold text-white">{t('settings')}</h2>
              </div>
              <button onClick={() => setShowSettings(false)} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs overflow-y-auto">
              <section className="space-y-2">
                <label htmlFor="secret-chat-name" className="flex items-center gap-2 font-medium text-purple-200">
                  <Sparkles size={16} className="text-pink-400" /> {t('chatName')}
                </label>
                <input id="secret-chat-name" type="text" value={settingsTitleDraft}
                  onChange={(e) => setSettingsTitleDraft(e.target.value)} maxLength={40}
                  placeholder="Secret Sanctuary"
                  className="w-full rounded-xl border border-purple-500/30 bg-[#121118] px-3 py-2.5 text-white outline-none placeholder:text-white/30 focus:border-pink-500" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSettingsTitleMode('local')}
                    className={`flex-1 rounded-xl border px-3 py-2 ${settingsTitleMode === 'local' ? 'border-pink-400 bg-pink-500/20 text-white' : 'border-purple-500/30 text-purple-200'}`}>
                    Only on my side
                  </button>
                  <button type="button" onClick={() => setSettingsTitleMode('shared')}
                    className={`flex-1 rounded-xl border px-3 py-2 ${settingsTitleMode === 'shared' ? 'border-pink-400 bg-pink-500/20 text-white' : 'border-purple-500/30 text-purple-200'}`}>
                    Both sides
                  </button>
                </div>
              </section>

              <section className="space-y-2">
                <div className="font-medium text-purple-200 flex items-center gap-2"><ImageIcon size={16} className="text-pink-400" /> Chat avatar</div>
                <div className="flex items-center gap-3">
                  {settingsAvatarDraft ? <img src={settingsAvatarDraft} alt="Avatar preview" className="h-16 w-16 rounded-2xl object-cover border border-purple-400/30" /> :
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white"><Sparkles size={24} /></div>}
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-purple-100 hover:bg-purple-500/20">
                    <Upload size={14} /> Choose image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChoose(e.target.files?.[0])} />
                  </label>
                  {settingsAvatarDraft && <button type="button" onClick={() => { setSettingsAvatarDraft(null); setAvatarFile(null); }} className="text-rose-300 hover:text-rose-200">Remove</button>}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSettingsAvatarMode('local')}
                    className={`flex-1 rounded-xl border px-3 py-2 ${settingsAvatarMode === 'local' ? 'border-pink-400 bg-pink-500/20 text-white' : 'border-purple-500/30 text-purple-200'}`}>
                    Only on my side
                  </button>
                  <button type="button" onClick={() => setSettingsAvatarMode('shared')}
                    className={`flex-1 rounded-xl border px-3 py-2 ${settingsAvatarMode === 'shared' ? 'border-pink-400 bg-pink-500/20 text-white' : 'border-purple-500/30 text-purple-200'}`}>
                    Both sides
                  </button>
                </div>
                <p className="text-[10px] text-purple-300/60">Images must be 5 MB or smaller.</p>
              </section>

              <div className="flex items-center justify-between border-t border-purple-500/20 pt-4">
                <div className="flex items-center gap-2 font-medium text-purple-200"><Globe size={16} className="text-pink-400" /> {t('language')}</div>
                <select value={lang} onChange={(e) => setLang(e.target.value as LangKey)}
                  className="rounded-xl border border-purple-500/30 bg-[#121118] px-3 py-2 text-white outline-none font-medium">
                  <option value="en">English</option><option value="vi">Tiếng Việt</option>
                  <option value="ja">日本語</option><option value="ko">한국어</option>
                  <option value="fr">Français 🇫🇷</option><option value="es">Español 🇪🇸</option>
                </select>
              </div>
              {settingsError && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300">{settingsError}</p>}
              <button type="button" onClick={handleSaveSettings} disabled={savingSettings}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50">
                {savingSettings ? <Loader2 size={15} className="animate-spin" /> : null}
                {savingSettings ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md cursor-zoom-out animate-fadeIn"
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-all hover:bg-white/20"
          >
            <X size={20} />
          </button>
          <img
            src={previewImage}
            alt="Fullscreen preview"
            className="max-h-[90vh] max-w-[90vw] rounded-3xl object-contain shadow-2xl border border-white/10"
          />
        </div>
      )}

      {/* Document Reader Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-md animate-fadeIn">
          <div className="flex flex-col h-[85vh] w-full max-w-3xl rounded-3xl border border-purple-500/30 bg-[#181622] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-purple-500/20 px-6 py-4 bg-purple-950/40">
              <div className="flex items-center gap-2.5">
                <FileText size={20} className="text-pink-400" />
                <h2 className="text-sm font-bold text-white">{previewDoc.name}</h2>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-purple-100 whitespace-pre-wrap leading-relaxed">
              {previewDoc.content}
            </div>
          </div>
        </div>
      )}

      {/* Floating Batch Delete Action Bar */}
      {selectMode && selectedIds.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 rounded-2xl border border-rose-500/30 bg-rose-950/90 px-6 py-3 shadow-2xl backdrop-blur-md animate-bounce">
          <span className="text-xs font-bold text-rose-200">
            {selectedIds.length} {t('selected')}
          </span>
          <button
            onClick={handleBatchLocalDelete}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:bg-rose-700"
          >
            <Trash2 size={14} />
            {t('deleteForMe')}
          </button>
        </div>
      )}

      {/* Scroll Down Button */}
      {!atBottom && (
        <button
          onClick={() => {
            setAtBottom(true);
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }}
          className="absolute bottom-24 right-8 rounded-full bg-black/60 border border-current/30 p-3 shadow-xl transition-all hover:scale-105 backdrop-blur-md"
        >
          <ChevronDown size={18} />
        </button>
      )}

      {/* Input Bar */}
      <div className={`border-t ${theme.border} ${theme.headerBg} p-4 backdrop-blur-md relative z-20`}>
        {sendError && (
          <div className="mb-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 text-xs text-rose-300 shadow-sm">
            ⚠️ {sendError}
          </div>
        )}
        <div className="flex items-center justify-between mb-3 px-2">
          <button
            onClick={() => setShowPinnedOnly((v) => !v)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              showPinnedOnly
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'bg-black/20 border border-current/15 opacity-80 hover:opacity-100'
            }`}
          >
            {showPinnedOnly ? `✨ ${t('showingPinned')}` : `📌 ${t('filterPinned')}`}
          </button>
          <span className="text-[11px] opacity-50">{t('pressEnter')}</span>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.zip"
            onChange={handleAttachmentUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Send Photo, Video, or Document"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-current/20 bg-current/5 text-current opacity-70 hover:opacity-100 hover:bg-current/10 transition-all shadow-sm"
          >
            <ImageIcon size={20} />
          </button>

          {/* Stickers Button */}
          <button
            type="button"
            onClick={() => setShowStickers(true)}
            title="Stickers"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-current/20 bg-current/5 text-current opacity-70 hover:opacity-100 hover:bg-current/10 transition-all shadow-sm"
          >
            <Smile size={20} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            maxLength={2000}
            autoComplete="off"
            className={`flex-1 rounded-2xl border border-current/20 ${theme.inputBg} px-5 py-3.5 text-sm outline-none transition-all placeholder:opacity-30 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 shadow-inner`}
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}