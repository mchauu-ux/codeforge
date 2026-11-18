  import { useEffect, useMemo, useRef, useState } from 'react';
  import { Send, Pin, PinOff, Trash2, Loader2, ArrowLeft, ChevronDown, Sparkles, Heart, Palette, CheckSquare, Square, Image as ImageIcon, FileText, Download, Eye, Settings, X, Globe, Smile, Upload, RotateCcw, Reply, Pencil, History } from 'lucide-react';
  import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
  import { useChatSettings } from '../hooks/useChatSettings';
  import type { ChatMessage } from '../types';

  interface TerminalChatProps {
    userId: string;
    onBack: () => void;
    displayMode?: 'standard' | 'terminal';
  }


  type ReplyEnvelope = {
    __codeforge_reply_v1: true;
    replyToId: string;
    replyToContent: string;
    replyToSenderId: string;
    message: string;
  };

  function parseReplyEnvelope(content: string): ReplyEnvelope | null {
    try {
      const value = JSON.parse(content);
      return value?.__codeforge_reply_v1 === true && typeof value.message === 'string'
        ? value as ReplyEnvelope
        : null;
    } catch {
      return null;
    }
  }

  function summarizeReplyContent(content: string): string {
    const nested = parseReplyEnvelope(content);
    const value = nested?.message ?? content;
    if (value.startsWith('data:image')) return '📷 Photo';
    if (value.startsWith('data:video')) return '🎥 Video';
    try {
      const file = JSON.parse(value);
      if (file?.name && file?.data) return `📎 ${file.name}`;
    } catch { /* regular text */ }
    return value.replace(/\\s+/g, ' ').slice(0, 120) || 'Message';
  }

  const DEFAULT_QUICK_EMOJIS = ['❤️', '😂', '😭', '😮', '👍', '🔥'];

// Broad Unicode emoji catalogue with searchable names; users can personalize the quick row.
const EMOJI_CATALOG = [
  ['😀','grinning face'],['😃','smiley'],['😄','smile'],['😁','beaming'],['😆','laughing'],['😅','sweat smile'],['🤣','rolling on the floor laughing'],['😂','tears of joy'],['🙂','slightly smiling'],['🙃','upside down'],['😉','wink'],['😊','blush'],['😇','angel'],['🥰','hearts'],['😍','heart eyes'],['🤩','star struck'],['😘','kiss'],['😗','kissing'],['☺️','smiling'],['😚','kissing closed eyes'],['😙','kissing smiling eyes'],['🥲','smiling tear'],['😋','yum'],['😛','tongue'],['😜','winking tongue'],['🤪','zany'],['😝','squinting tongue'],['🤑','money mouth'],['🤗','hug'],['🤭','hand over mouth'],['🫢','open eyes hand over mouth'],['🫣','peeking'],['🤫','shush'],['🤔','thinking'],['🫡','salute'],['🤐','zipper mouth'],['🤨','raised eyebrow'],['😐','neutral'],['😑','expressionless'],['😶','no mouth'],['🫥','dotted line face'],['😏','smirk'],['😒','unamused'],['🙄','eye roll'],['😬','grimace'],['😮‍💨','sigh'],['🤥','lying'],['😌','relieved'],['😔','pensive'],['😪','sleepy'],['🤤','drooling'],['😴','sleeping'],['😷','mask'],['🤒','thermometer'],['🤕','bandage'],['🤢','nauseated'],['🤮','vomit'],['🤧','sneeze'],['🥵','hot'],['🥶','cold'],['🥴','woozy'],['😵','dizzy'],['🤯','exploding head'],['🤠','cowboy'],['🥳','party'],['🥸','disguised'],['😎','sunglasses'],['🤓','nerd'],['🧐','monocle'],['😕','confused'],['🫤','diagonal mouth'],['😟','worried'],['🙁','slightly frowning'],['☹️','frowning'],['😮','open mouth'],['😯','hushed'],['😲','astonished'],['😳','flushed'],['🥺','pleading'],['🥹','holding back tears'],['😦','frowning open mouth'],['😧','anguished'],['😨','fearful'],['😰','anxious sweat'],['😥','sad relieved'],['😢','cry'],['😭','loudly crying'],['😱','screaming'],['😖','confounded'],['😣','persevere'],['😞','disappointed'],['😓','downcast sweat'],['😩','weary'],['😫','tired'],['🥱','yawning'],['😤','triumph'],['😡','pouting'],['😠','angry'],['🤬','cursing'],['😈','smiling devil'],['👿','angry devil'],['💀','skull'],['☠️','skull crossbones'],['💩','poop'],['🤡','clown'],['👻','ghost'],['👽','alien'],['🤖','robot'],['🎃','jack o lantern'],['😺','grinning cat'],['😸','grinning cat eyes'],['😹','joy cat'],['😻','heart eyes cat'],['😼','smirk cat'],['😽','kissing cat'],['🙀','weary cat'],['😿','crying cat'],['😾','pouting cat'],
  ['👋','wave'],['🤚','raised back hand'],['🖐️','hand fingers splayed'],['✋','raised hand'],['🖖','vulcan'],['🫱','rightwards hand'],['🫲','leftwards hand'],['🫳','palm down'],['🫴','palm up'],['👌','ok'],['🤌','pinched fingers'],['🤏','pinching'],['✌️','victory'],['🤞','crossed fingers'],['🫰','hand with index finger and thumb crossed'],['🤟','love you'],['🤘','horns'],['🤙','call me'],['👈','point left'],['👉','point right'],['👆','point up'],['👇','point down'],['☝️','index up'],['👍','thumbs up'],['👎','thumbs down'],['✊','fist'],['👊','oncoming fist'],['🤛','left fist'],['🤜','right fist'],['👏','clap'],['🙌','raised hands'],['🫶','heart hands'],['👐','open hands'],['🤲','palms up'],['🤝','handshake'],['🙏','pray'],['✍️','writing'],['💅','nail polish'],['🤳','selfie'],['💪','flex'],['🦾','mechanical arm'],['🦿','mechanical leg'],['🦵','leg'],['🦶','foot'],['👂','ear'],['🦻','ear hearing aid'],['👃','nose'],['🧠','brain'],['🫀','anatomical heart'],['🫁','lungs'],['🦷','tooth'],['🦴','bone'],['👀','eyes'],['👁️','eye'],['👅','tongue'],['👄','mouth'],
  ['❤️','red heart'],['🧡','orange heart'],['💛','yellow heart'],['💚','green heart'],['💙','blue heart'],['🩵','light blue heart'],['💜','purple heart'],['🤎','brown heart'],['🖤','black heart'],['🩶','grey heart'],['🤍','white heart'],['💔','broken heart'],['❤️‍🔥','heart on fire'],['❤️‍🩹','mending heart'],['💕','two hearts'],['💞','revolving hearts'],['💓','beating heart'],['💗','growing heart'],['💖','sparkling heart'],['💘','heart arrow'],['💝','heart ribbon'],['💟','heart decoration'],['❣️','heart exclamation'],['💌','love letter'],['💋','kiss mark'],['💯','hundred'],['💢','anger'],['💥','collision'],['💫','dizzy'],['💦','sweat droplets'],['💨','dash'],['🕳️','hole'],['💬','speech'],['👁️‍🗨️','eye speech bubble'],['🗨️','left speech bubble'],['🗯️','anger bubble'],['💭','thought bubble'],['💤','zzz'],
  ['🐶','dog'],['🐱','cat'],['🐭','mouse'],['🐹','hamster'],['🐰','rabbit'],['🦊','fox'],['🐻','bear'],['🐼','panda'],['🐨','koala'],['🐯','tiger'],['🦁','lion'],['🐮','cow'],['🐷','pig'],['🐸','frog'],['🐵','monkey'],['🙈','see no evil'],['🙉','hear no evil'],['🙊','speak no evil'],['🐔','chicken'],['🐧','penguin'],['🐦','bird'],['🦆','duck'],['🦉','owl'],['🦇','bat'],['🐺','wolf'],['🐗','boar'],['🐴','horse'],['🦄','unicorn'],['🐝','bee'],['🦋','butterfly'],['🐌','snail'],['🐞','lady beetle'],['🐜','ant'],['🪲','beetle'],['🕷️','spider'],['🦂','scorpion'],['🐢','turtle'],['🐍','snake'],['🦎','lizard'],['🦖','t rex'],['🦕','sauropod'],['🐙','octopus'],['🦑','squid'],['🦐','shrimp'],['🦀','crab'],['🐡','blowfish'],['🐠','tropical fish'],['🐟','fish'],['🐬','dolphin'],['🐳','whale'],['🦈','shark'],['🐊','crocodile'],['🐅','tiger'],['🐆','leopard'],['🦓','zebra'],['🦍','gorilla'],['🦧','orangutan'],['🐘','elephant'],['🦛','hippo'],['🦏','rhino'],['🐪','camel'],['🦒','giraffe'],['🦘','kangaroo'],['🦬','bison'],['🐄','cow'],['🐎','horse'],['🐖','pig'],['🐑','sheep'],['🦙','llama'],['🐐','goat'],['🦌','deer'],['🐕','dog'],['🐈','cat'],['🐓','rooster'],['🦃','turkey'],['🦚','peacock'],['🦜','parrot'],['🦢','swan'],['🦩','flamingo'],['🕊️','dove'],['🐇','rabbit'],['🦝','raccoon'],['🦨','skunk'],['🦡','badger'],['🦦','otter'],['🦥','sloth'],['🐁','mouse'],['🐀','rat'],['🐿️','chipmunk'],['🦔','hedgehog'],
  ['🌸','cherry blossom'],['🌹','rose'],['🌺','hibiscus'],['🌻','sunflower'],['🌼','blossom'],['🌷','tulip'],['🪻','hyacinth'],['🌱','seedling'],['🌲','evergreen tree'],['🌳','deciduous tree'],['🌴','palm tree'],['🌵','cactus'],['🍀','four leaf clover'],['🍁','maple leaf'],['🍂','fallen leaf'],['🍃','leaf fluttering'],['🪴','potted plant'],['🌾','sheaf of rice'],['🌿','herb'],['☘️','shamrock'],['🍄','mushroom'],['🌞','sun face'],['🌝','full moon face'],['🌛','first quarter moon face'],['🌜','last quarter moon face'],['🌚','new moon face'],['🌕','full moon'],['🌙','crescent moon'],['⭐','star'],['🌟','glowing star'],['✨','sparkles'],['⚡','lightning'],['🔥','fire'],['🌈','rainbow'],['☀️','sun'],['⛅','sun behind cloud'],['🌤️','sun behind small cloud'],['🌧️','rain cloud'],['⛈️','thunder cloud'],['❄️','snowflake'],['☃️','snowman'],['🌊','water wave'],
  ['🍏','green apple'],['🍎','red apple'],['🍐','pear'],['🍊','orange'],['🍋','lemon'],['🍌','banana'],['🍉','watermelon'],['🍇','grapes'],['🍓','strawberry'],['🫐','blueberries'],['🍈','melon'],['🍒','cherries'],['🍑','peach'],['🥭','mango'],['🍍','pineapple'],['🥥','coconut'],['🥝','kiwi'],['🍅','tomato'],['🍆','eggplant'],['🥑','avocado'],['🥦','broccoli'],['🥬','leafy green'],['🥒','cucumber'],['🌶️','hot pepper'],['🫑','bell pepper'],['🌽','corn'],['🥕','carrot'],['🧄','garlic'],['🧅','onion'],['🥔','potato'],['🍠','sweet potato'],['🥐','croissant'],['🥯','bagel'],['🍞','bread'],['🥖','baguette'],['🧀','cheese'],['🥚','egg'],['🍳','cooking'],['🧈','butter'],['🥞','pancakes'],['🧇','waffle'],['🥓','bacon'],['🍔','burger'],['🍟','fries'],['🍕','pizza'],['🌭','hot dog'],['🥪','sandwich'],['🌮','taco'],['🌯','burrito'],['🫔','tamale'],['🥗','salad'],['🍝','spaghetti'],['🍜','ramen'],['🍲','pot of food'],['🍛','curry rice'],['🍣','sushi'],['🍱','bento'],['🥟','dumpling'],['🍤','fried shrimp'],['🍙','rice ball'],['🍚','cooked rice'],['🍘','rice cracker'],['🍥','fish cake'],['🥠','fortune cookie'],['🥮','moon cake'],['🍡','dango'],['🍧','shaved ice'],['🍨','ice cream'],['🍦','soft ice cream'],['🥧','pie'],['🧁','cupcake'],['🍰','cake'],['🎂','birthday cake'],['🍮','custard'],['🍭','lollipop'],['🍬','candy'],['🍫','chocolate'],['🍿','popcorn'],['🍩','doughnut'],['🍪','cookie'],['🌰','chestnut'],['🥜','peanuts'],['☕','coffee'],['🫖','teapot'],['🍵','tea'],['🧋','bubble tea'],['🥤','cup with straw'],['🧃','juice box'],['🧉','mate'],['🍶','sake'],['🍺','beer'],['🥂','clinking glasses'],['🍷','wine'],['🥛','milk'],['🍼','baby bottle'],
  ['⚽','soccer'],['🏀','basketball'],['🏈','football'],['⚾','baseball'],['🥎','softball'],['🎾','tennis'],['🏐','volleyball'],['🏉','rugby'],['🥏','flying disc'],['🎱','pool 8 ball'],['🏓','ping pong'],['🏸','badminton'],['🏒','hockey'],['🥅','goal net'],['⛳','golf'],['🏹','bow and arrow'],['🎣','fishing'],['🤿','diving mask'],['🥊','boxing glove'],['🥋','martial arts'],['🎽','running shirt'],['🛹','skateboard'],['🛼','roller skate'],['🛷','sled'],['⛸️','ice skate'],['🥌','curling stone'],['🎿','skis'],['⛷️','skier'],['🏂','snowboard'],['🏋️','weightlifting'],['🤼','wrestling'],['🤸','cartwheel'],['⛹️','bouncing ball'],['🤺','fencing'],['🏇','horse racing'],['🧘','lotus position'],['🏄','surfing'],['🏊','swimming'],['🚴','cycling'],['🚵','mountain biking'],['🎮','video game'],['🕹️','joystick'],['🎯','bullseye'],['🎲','dice'],['🧩','puzzle'],['♟️','chess pawn'],['🎭','performing arts'],['🎨','artist palette'],['🎼','musical score'],['🎤','microphone'],['🎧','headphones'],['🎹','piano'],['🥁','drum'],['🎷','saxophone'],['🎺','trumpet'],['🎸','guitar'],['🪕','banjo'],['🎻','violin'],['🎬','clapper'],['🎟️','admission tickets'],['🎫','ticket'],['🎪','circus'],['🎉','party popper'],['🎊','confetti'],['🎈','balloon'],['🎁','gift'],['🏆','trophy'],['🥇','gold medal'],['🥈','silver medal'],['🥉','bronze medal'],['🏅','sports medal'],['🎖️','military medal'],['🎀','ribbon'],['🪄','magic wand'],['🪅','pinata'],['🧸','teddy bear'],['🪁','kite'],['🪀','yo yo'],['🪩','mirror ball'],
  ['🚗','car'],['🚕','taxi'],['🚌','bus'],['🚎','trolleybus'],['🏎️','racing car'],['🚓','police car'],['🚑','ambulance'],['🚒','fire engine'],['🚚','delivery truck'],['🚲','bicycle'],['🛴','scooter'],['🛵','motor scooter'],['🏍️','motorcycle'],['✈️','airplane'],['🛫','airplane departure'],['🛬','airplane arrival'],['🚀','rocket'],['🛸','flying saucer'],['🚁','helicopter'],['🚢','ship'],['⛵','sailboat'],['🚤','speedboat'],['🚂','locomotive'],['🚆','train'],['🚇','metro'],['🚉','station'],['🚦','traffic light'],['🗺️','world map'],['🗽','statue of liberty'],['🗼','tokyo tower'],['🏰','castle'],['🏯','japanese castle'],['🏟️','stadium'],['🎡','ferris wheel'],['🎢','roller coaster'],['🏖️','beach'],['🏝️','desert island'],['🏕️','camping'],['⛰️','mountain'],['🏔️','snow mountain'],['🌋','volcano'],['🗻','mount fuji'],['🏠','house'],['🏡','house garden'],['🏢','office building'],['🏫','school'],['🏥','hospital'],['🏦','bank'],['🏨','hotel'],['🏪','convenience store'],['🏬','department store'],['🏛️','classical building'],['⛪','church'],['🕌','mosque'],['🛕','hindu temple'],['🕍','synagogue'],['⛩️','shinto shrine'],['🕋','kaaba'],['⛲','fountain'],['⛺','tent'],['🌃','night with stars'],['🌆','cityscape'],['🌇','sunset'],['🌉','bridge at night'],
  ['⌚','watch'],['📱','mobile phone'],['💻','laptop'],['⌨️','keyboard'],['🖥️','desktop computer'],['🖨️','printer'],['🖱️','computer mouse'],['🖲️','trackball'],['💽','computer disk'],['💾','floppy disk'],['💿','cd'],['📀','dvd'],['📷','camera'],['📸','camera flash'],['📹','video camera'],['🎥','movie camera'],['📞','telephone'],['☎️','phone'],['📺','television'],['📻','radio'],['🎙️','studio microphone'],['⏰','alarm clock'],['⌛','hourglass'],['⏳','hourglass not done'],['📡','satellite antenna'],['🔋','battery'],['🪫','low battery'],['🔌','electric plug'],['💡','light bulb'],['🔦','flashlight'],['🕯️','candle'],['🧯','fire extinguisher'],['🛢️','oil drum'],['💸','money with wings'],['💵','dollar banknote'],['💴','yen banknote'],['💶','euro banknote'],['💷','pound banknote'],['💰','money bag'],['💳','credit card'],['🧾','receipt'],['💎','gem stone'],['⚖️','balance scale'],['🔧','wrench'],['🪛','screwdriver'],['🔨','hammer'],['⚒️','hammer pick'],['🛠️','tools'],['⛏️','pick'],['🔩','nut bolt'],['⚙️','gear'],['🧲','magnet'],['🪜','ladder'],['🧰','toolbox'],['🧪','test tube'],['🧫','petri dish'],['🧬','dna'],['🔬','microscope'],['🔭','telescope'],['📚','books'],['📖','open book'],['📝','memo'],['✏️','pencil'],['🖊️','pen'],['🖋️','fountain pen'],['📎','paperclip'],['🔒','locked'],['🔓','unlocked'],['🔑','key'],['🗝️','old key'],['🔨','hammer'],['🧹','broom'],['🧺','basket'],['🧻','roll of paper'],['🪣','bucket'],['🧼','soap'],['🪥','toothbrush'],['🧽','sponge'],['🧴','lotion bottle'],['🛏️','bed'],['🛋️','couch'],['🚪','door'],['🪞','mirror'],['🪟','window'],['🪑','chair'],['🚽','toilet'],['🚿','shower'],['🛁','bathtub'],['🧸','teddy bear'],['🖼️','framed picture'],['🪆','nesting dolls'],
  ['❤️','red heart'],['☮️','peace'],['✝️','cross'],['☯️','yin yang'],['♈','aries'],['♉','taurus'],['♊','gemini'],['♋','cancer'],['♌','leo'],['♍','virgo'],['♎','libra'],['♏','scorpio'],['♐','sagittarius'],['♑','capricorn'],['♒','aquarius'],['♓','pisces'],['🔴','red circle'],['🟠','orange circle'],['🟡','yellow circle'],['🟢','green circle'],['🔵','blue circle'],['🟣','purple circle'],['⚫','black circle'],['⚪','white circle'],['🟤','brown circle'],['🔺','red triangle'],['🔻','red down triangle'],['💠','diamond'],['🔷','blue diamond'],['🔶','orange diamond'],['🔹','small blue diamond'],['🔸','small orange diamond'],['▪️','small black square'],['▫️','small white square'],['◾','medium small black square'],['◽','medium small white square'],['⬛','black large square'],['⬜','white large square'],['🟥','red square'],['🟧','orange square'],['🟨','yellow square'],['🟩','green square'],['🟦','blue square'],['🟪','purple square'],['🟫','brown square'],['✅','check mark'],['❌','cross mark'],['❓','question mark'],['❗','exclamation'],['‼️','double exclamation'],['⁉️','exclamation question'],['💤','zzz'],['🔔','bell'],['🔕','bell slash'],['🔆','bright'],['🔅','dim'],['🔱','trident'],['⚜️','fleur de lis'],['🔰','japanese symbol beginner'],['♻️','recycling'],['⚠️','warning'],['🚫','prohibited'],['💮','white flower'],['🏁','chequered flag'],['🚩','triangular flag'],['🎌','crossed flags'],['🏳️','white flag'],['🏴','black flag'],['🏳️‍🌈','rainbow flag'],['🏳️‍⚧️','transgender flag'],
] as const;
const UNIQUE_EMOJI_CATALOG = Array.from(new Map(EMOJI_CATALOG.map(([emoji, name]) => [emoji, [emoji, name] as const])).values());

  type TerminalPalette = {
    background: string;
    primaryText: string;
    secondaryText: string;
    accent: string;
  };

  const DEFAULT_TERMINAL_PALETTE: TerminalPalette = {
    background: '#04150e',
    primaryText: '#9be7ff',
    secondaryText: '#4f8ee8',
    accent: '#39df91',
  };

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

  export default function TerminalChat({ userId, onBack, displayMode = 'standard' }: TerminalChatProps) {
    const isTerminal = displayMode === 'terminal';
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


    const { messages, reactions, edits, connected, sendMessage, toggleReaction, togglePin, editMessage, recallMessage } =
      useRealtimeMessages(userId, () => mountedRef.current);
    
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [reactionMenuFor, setReactionMenuFor] = useState<string | null>(null);
    const [activeToolbarFor, setActiveToolbarFor] = useState<string | null>(null);
    const [emojiSearch, setEmojiSearch] = useState('');
    const [editingQuickEmojis, setEditingQuickEmojis] = useState(false);
    const quickEmojiKey = `codeforge_quick_emojis_${userId}`;
    const [quickEmojis, setQuickEmojis] = useState<string[]>(() => {
      try { return JSON.parse(localStorage.getItem(`codeforge_quick_emojis_${userId}`) || 'null') || DEFAULT_QUICK_EMOJIS; }
      catch { return DEFAULT_QUICK_EMOJIS; }
    });
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState('');
    const [historyFor, setHistoryFor] = useState<string | null>(null);
    const [messageActionError, setMessageActionError] = useState<string | null>(null);
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
    const terminalPaletteKey = `secret_chat_terminal_palette_${userId}`;
    const [terminalPalette, setTerminalPalette] = useState<TerminalPalette>(() => {
      try {
        const saved = localStorage.getItem(`secret_chat_terminal_palette_${userId}`);
        return saved ? { ...DEFAULT_TERMINAL_PALETTE, ...JSON.parse(saved) } : DEFAULT_TERMINAL_PALETTE;
      } catch {
        return DEFAULT_TERMINAL_PALETTE;
      }
    });

    const theme = THEMES[themeKey];

    useEffect(() => {
      localStorage.setItem(terminalPaletteKey, JSON.stringify(terminalPalette));
    }, [terminalPalette, terminalPaletteKey]);

    useEffect(() => {
      localStorage.setItem('secret_chat_theme', themeKey);
    }, [themeKey]);

    useEffect(() => {
      localStorage.setItem(quickEmojiKey, JSON.stringify(quickEmojis));
    }, [quickEmojis, quickEmojiKey]);

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
      const messageText = draft.trim();
      if (!messageText || sending) return;
      const content = replyTo ? JSON.stringify({
        __codeforge_reply_v1: true,
        replyToId: replyTo.id,
        replyToContent: summarizeReplyContent(replyTo.content),
        replyToSenderId: replyTo.sender_id,
        message: messageText,
      } as ReplyEnvelope) : messageText;
      setSending(true);
      setSendError(null);
      const { error } = await sendMessage(content);
      if (error) {
        setSendError(error);
      } else {
        setDraft('');
        setReplyTo(null);
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
      setMessageActionError(null);
      const { error } = await recallMessage(id);
      if (error) setMessageActionError(error);
    };

    const beginEdit = (message: ChatMessage) => {
      const parsed = parseReplyEnvelope(message.content);
      setEditingMessageId(message.id);
      setEditDraft(parsed?.message ?? message.content);
      setMessageActionError(null);
    };

    const saveEdit = async (message: ChatMessage) => {
      const nextText = editDraft.trim();
      if (!nextText) return;
      const parsed = parseReplyEnvelope(message.content);
      const nextContent = parsed ? JSON.stringify({ ...parsed, message: nextText }) : nextText;
      const { error } = await editMessage(message.id, nextContent);
      if (error) setMessageActionError(error);
      else setEditingMessageId(null);
    };

    const canEditMessage = (message: ChatMessage) => Date.now() - new Date(message.created_at).getTime() <= 24 * 60 * 60 * 1000;
    const canRecallMessage = (message: ChatMessage) => Date.now() - new Date(message.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000;

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
      <div
        className={`fixed inset-0 z-50 flex transition-colors duration-300 ${
          isTerminal
            ? 'items-stretch justify-stretch bg-black/70 p-0 font-mono'
            : `flex-col font-sans ${theme.bg} ${theme.text}`
        }`}
      >
        <div
          className={isTerminal
            ? 'flex h-dvh w-full max-w-none min-h-0 flex-col overflow-hidden rounded-none border-0 shadow-2xl'
            : 'flex min-h-0 flex-1 flex-col'}
          style={isTerminal ? { backgroundColor: terminalPalette.background, color: terminalPalette.primaryText } : undefined}
        >
        {/* Header */}
        <header
          className={`group flex items-center justify-between border-b px-4 sm:px-6 py-3 backdrop-blur-md shadow-lg relative z-20 ${
            isTerminal ? 'border-emerald-400/20 bg-black/35' : `${theme.border} ${theme.headerBg} py-4`
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className={`flex items-center gap-1.5 border px-3 sm:px-4 py-1.5 text-xs font-medium transition-all hover:scale-[1.02] ${
                isTerminal ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-300 hover:bg-emerald-400/10 rounded-md' : 'rounded-full border-current/20 bg-current/5 hover:bg-current/10'
              }`}
            >
              <ArrowLeft size={14} />
              {isTerminal ? 'EXIT' : t('back')}
            </button>
            {isTerminal ? (
              <div className="min-w-0">
                <h1 className="truncate text-xs sm:text-sm font-bold tracking-wide" style={{ color: terminalPalette.accent }}>
                  root@codeforge:~$
                </h1>
                <p className="truncate text-[10px] opacity-55">./open-channel --shared</p>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {chatAvatar ? (
                  <img src={chatAvatar} alt="Chat avatar" className="h-9 w-9 rounded-2xl object-cover border border-white/20 shadow-md" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white shadow-md">
                    <Sparkles size={18} />
                  </span>
                )}
                <div><h1 className="text-sm font-bold tracking-wide">{chatTitle}</h1></div>
              </div>
            )}
          </div>

          <div className={`flex items-center gap-3 text-xs transition-opacity ${isTerminal ? 'opacity-100 sm:pointer-events-none sm:opacity-0 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100 sm:group-focus-within:pointer-events-auto sm:group-focus-within:opacity-100' : ''}`}>
            <button
              onClick={() => {
                setSelectMode((v) => !v);
                setSelectedIds([]);
              }}
              className={`flex items-center gap-1.5 border px-3 py-1.5 text-[11px] sm:text-xs font-medium transition-all ${
                isTerminal ? 'rounded-md border-emerald-400/25 bg-emerald-400/5 hover:bg-emerald-400/10' : 'rounded-full border-current/20 bg-current/5 hover:bg-current/10'
              } ${selectMode ? (isTerminal ? 'text-emerald-200 border-emerald-300/70' : 'border-pink-500 bg-pink-500/20 text-white') : ''}`}
            >
              <CheckSquare size={14} />
              <span className={isTerminal ? 'hidden sm:inline' : ''}>{selectMode ? t('cancelSelect') : t('selectToDelete')}</span>
            </button>

            {!isTerminal && <button
              onClick={openSettings}
              className={`flex items-center gap-1.5 border px-3 py-1.5 text-[11px] sm:text-xs font-medium transition-all ${isTerminal ? 'rounded-md border-emerald-400/25 bg-emerald-400/5 hover:bg-emerald-400/10' : 'rounded-full border-current/20 bg-current/5 hover:bg-current/10'}`}
              title={t('settings')}
            >
              <Settings size={14} />
              <span className="hidden sm:inline">{t('settings')}</span>
            </button>}

            {/* Theme Switcher Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu((v) => !v)}
                className={`flex items-center gap-1.5 border px-3 py-1.5 text-[11px] sm:text-xs font-medium transition-all ${isTerminal ? 'rounded-md border-emerald-400/25 bg-emerald-400/5 hover:bg-emerald-400/10' : 'rounded-full border-current/20 bg-current/5 hover:bg-current/10'}`}
                title={isTerminal ? 'Customize terminal colors' : 'Change Theme'}
              >
                <Palette size={14} />
                <span className="hidden sm:inline">{isTerminal ? 'Colors' : theme.name}</span>
              </button>

              {showThemeMenu && (
                isTerminal ? (
                  <div className="absolute right-0 mt-2 w-64 rounded-md border border-emerald-400/30 bg-[#020b07] p-3 shadow-2xl z-50 text-emerald-100">
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-emerald-400">Terminal palette</div>
                    {([
                      ['background', 'Background'],
                      ['primaryText', 'Your messages'],
                      ['secondaryText', 'Other messages'],
                      ['accent', 'Prompt / accents'],
                    ] as const).map(([key, label]) => (
                      <label key={key} className="mb-2 flex items-center justify-between gap-3 text-xs">
                        <span>{label}</span>
                        <input
                          type="color"
                          value={terminalPalette[key]}
                          onChange={(event) => setTerminalPalette((current) => ({ ...current, [key]: event.target.value }))}
                          className="h-7 w-10 cursor-pointer rounded border border-emerald-400/25 bg-transparent"
                          aria-label={label}
                        />
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setTerminalPalette(DEFAULT_TERMINAL_PALETTE)}
                      className="mt-2 w-full border border-emerald-400/25 px-3 py-2 text-[10px] text-emerald-300 hover:bg-emerald-400/10"
                    >Reset colors</button>
                  </div>
                ) : (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-purple-500/20 bg-[#181622] p-2 shadow-2xl backdrop-blur-xl z-50">
                    <div className="mb-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider opacity-50">{t('selectTheme')}</div>
                    {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                      <button key={key} onClick={() => { setThemeKey(key); setShowThemeMenu(false); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${themeKey === key ? 'bg-purple-500/20 text-white font-bold' : 'text-purple-200/70 hover:bg-purple-500/10 hover:text-white'}`}>
                        <span>{THEMES[key].name}</span>
                        {themeKey === key && <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>

            <div className={`flex items-center gap-2 border px-3 py-1 shadow-inner text-[10px] sm:text-xs ${isTerminal ? 'rounded-md bg-black/30 border-emerald-400/20' : 'rounded-full bg-black/30 border-current/15'}`}>
              <span
                className={`h-2 w-2 rounded-full ${
                  connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className={isTerminal ? 'hidden sm:inline' : ''}>{connected ? t('live') : t('connecting')}</span>
            </div>
          </div>
        </header>

        {/* Pinned Messages Banner */}
        {pinned.length > 0 && (
          <div className={`border-b px-6 py-2.5 text-xs backdrop-blur-sm ${isTerminal ? 'border-emerald-400/20 bg-black/25' : 'border-amber-400/20 bg-amber-500/10 text-amber-200'}`} style={isTerminal ? { color: terminalPalette.accent } : undefined}>
            <div className="mb-1 flex items-center gap-1.5 font-bold tracking-wide">
              <Pin size={13} className="text-amber-400 animate-bounce" />
              {t('pinnedNotes')} ({pinned.length})
            </div>
            {pinned.map((m) => {
              let desc = summarizeReplyContent(m.content);
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
                <div key={m.id} className={`truncate pl-5 italic ${isTerminal ? 'opacity-75' : 'text-amber-100/80'}`}>
                  {isTerminal ? '> ' : '✦ '}{desc}
                </div>
              );
            })}
          </div>
        )}

        {/* Chat Messages Area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onClick={(event) => { if (!(event.target as HTMLElement).closest('[data-message-row]')) { setActiveToolbarFor(null); setReactionMenuFor(null); } }}
          className={`flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-4 sm:px-6 ${isTerminal ? 'pt-5 pb-6 space-y-3 bg-black/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : 'pt-16 pb-6 space-y-4 bg-gradient-to-b from-transparent via-black/10 to-transparent'}`}
        >
          <div className={`${isTerminal ? 'mb-4 border-b border-current/10 pb-3 text-left' : 'text-center my-3'}`}>
            {isTerminal ? (
              <span className="text-[11px] tracking-wide" style={{ color: terminalPalette.accent }}>// SECURE CHANNEL ACTIVE · REALTIME STREAM</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-current/5 border border-current/10 px-4 py-1 text-[11px] opacity-80 shadow-sm">
                <Heart size={12} className="text-pink-400 fill-pink-400" />{t('secureActive')}
              </span>
            )}
          </div>

          {messageActionError && <div className="mb-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{messageActionError}</div>}

          {visible.length === 0 && (
            isTerminal ? (
              <div className="py-8 text-sm opacity-60" style={{ color: terminalPalette.secondaryText }}>$ no messages in this channel yet<span className="ml-2 animate-pulse" style={{ color: terminalPalette.accent }}>▌</span></div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-current/10 border border-current/20 mb-3"><Sparkles size={28} className="animate-pulse" /></div>
                <p className="text-sm font-medium">{t('quietHere')}</p><p className="text-xs opacity-80 mt-1">{t('sendFirst')}</p>
              </div>
            )
          )}

          {visible.map((m) => {
      
            const own = m.sender_id === userId;
            const isSelected = selectedIds.includes(m.id);
            const replyEnvelope = parseReplyEnvelope(m.content);
            const messageContent = replyEnvelope?.message ?? m.content;
            const isRecalled = Boolean(m.recalled_at);
            const isImage = messageContent.startsWith('data:image');
            const isVideo = messageContent.startsWith('data:video');

            let filePayload = null;
            try {
              if (messageContent.startsWith('{')) filePayload = JSON.parse(messageContent);
            } catch {}
            const isFileCard = filePayload && filePayload.data;
            const messageReactions = reactions.filter((reaction) => reaction.message_id === m.id);
            const reactionCounts = [...new Set(messageReactions.map((reaction) => reaction.emoji))].map((emoji) => ({
              emoji,
              count: messageReactions.filter((reaction) => reaction.emoji === emoji).length,
              mine: messageReactions.some((reaction) => reaction.emoji === emoji && reaction.user_id === userId),
            })).filter((reaction) => reaction.count > 0);

            return (
            <div
    key={m.id}
    className={`group relative flex items-start gap-2 px-2 ${isTerminal ? 'justify-start' : own ? 'justify-end' : 'justify-start'}`} data-message-row={m.id}
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
  <div className={`relative flex min-w-0 flex-col gap-1 ${isTerminal ? 'w-fit max-w-[min(78vw,560px)] items-start' : `w-full max-w-[min(78vw,560px)] ${own ? 'items-end' : 'items-start'}`} `}>
                <div className={`relative flex w-full items-start max-w-full ${isTerminal ? 'justify-start' : own ? 'justify-end' : 'justify-start'} `}>
                    {isTerminal && !own && (
                      <span className="mr-2 shrink-0 text-sm font-bold leading-6" style={{ color: terminalPalette.accent }} aria-hidden="true">&gt;</span>
                    )}
                    {/* Message / Media / File Item */}
                    <div
                      onClick={() => {
                        if (selectMode) toggleSelectMessage(m.id);
                        else if (isTerminal) setActiveToolbarFor((current) => current === m.id ? null : m.id);
                      }}
                      className={`relative transition-all min-w-0 ${
                        isTerminal
                          ? `w-fit max-w-full text-[13px] leading-6 ${m.is_pinned ? 'outline outline-1 outline-current/30' : ''}`
                          : isImage || isVideo || isFileCard
                            ? ''
                            : `w-fit max-w-full rounded-2xl p-3.5 text-sm shadow-md ${own ? theme.bubbleOwn : theme.bubbleOther} ${own ? 'rounded-br-sm' : 'rounded-bl-sm'} ${m.is_pinned ? 'ring-2 ring-amber-400/60' : ''}`
                      } ${selectMode ? 'cursor-pointer hover:opacity-90' : ''}`}
                      style={isTerminal ? { color: own ? terminalPalette.primaryText : terminalPalette.secondaryText } : undefined}
                    >
                      {isRecalled ? (
                        <p className={`px-2 py-1 italic opacity-60 ${isTerminal ? 'font-mono' : 'text-sm'}`}>Message recalled</p>
                      ) : editingMessageId === m.id ? (
                        <div className="flex min-w-[220px] flex-col gap-2">
                          <textarea value={editDraft} onChange={(event) => setEditDraft(event.target.value)} rows={3} maxLength={2000} className="w-full rounded-lg border border-current/20 bg-black/20 p-2 text-sm outline-none" />
                          <div className="flex justify-end gap-2 text-xs">
                            <button type="button" onClick={() => setEditingMessageId(null)} className="rounded-md border border-current/20 px-2 py-1">Cancel</button>
                            <button type="button" onClick={() => void saveEdit(m)} className="rounded-md bg-emerald-500/20 px-2 py-1 text-emerald-300">Save</button>
                          </div>
                        </div>
                      ) : (
                      <>
                      {replyEnvelope && (
                        <div className={`mb-2 border-l-2 px-2 py-1 text-[11px] opacity-75 ${isTerminal ? 'border-current/50 bg-current/5' : 'border-pink-300/60 bg-black/10 rounded-r-lg'}`}>
                          <div className="font-semibold">{replyEnvelope.replyToSenderId === userId ? 'You' : 'Replying to message'}</div>
                          <div className="truncate max-w-full">{replyEnvelope.replyToContent.startsWith('data:image') ? '📷 Photo' : replyEnvelope.replyToContent.startsWith('data:video') ? '🎥 Video' : replyEnvelope.replyToContent.slice(0, 100)}</div>
                        </div>
                      )}
                      {isImage ? (
                        <img
                          src={messageContent}
                          alt="Shared media"
                          onClick={() => setPreviewImage(messageContent)}
                          className="rounded-3xl max-h-80 w-full object-cover cursor-pointer hover:opacity-95 transition-all shadow-lg border border-current/10"
                          title={t('clickToView')}
                        />
                      ) : isVideo ? (
                        <video
                          src={messageContent}
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
                          {messageContent}
                        </p>
                      )}
                      </>
                      )}
                    </div>
                  </div>

                  {/* Timestamp right underneath, perfectly aligned to the right edge */}
                <div className={`flex items-center gap-1 text-[9px] opacity-55 w-full ${isTerminal ? 'justify-start' : own ? 'justify-end' : 'justify-start'} ${isTerminal ? 'font-mono' : ''}`}>
    <span>{isTerminal ? `[${formatDateTime(m.created_at)}]` : formatDateTime(m.created_at)}</span>
    {m.updated_at && m.updated_at !== m.created_at && !isRecalled && <span className="italic">· Edited</span>}
    {m.is_pinned && (    <Pin size={9} className="text-amber-400 fill-amber-400 inline" />
  )}
  </div>
                  {reactionCounts.length > 0 && (
                    <div className={`flex flex-wrap gap-1 ${isTerminal ? 'justify-start' : own ? 'justify-end' : 'justify-start'}`}>
                      {reactionCounts.map(({ emoji, count, mine }) => (
                        <button key={emoji} type="button" onClick={() => void toggleReaction(m.id, emoji)}
                          className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${mine ? 'border-sky-400/70 bg-sky-400/15' : 'border-current/20 bg-black/10'}`}
                          title={mine ? 'Remove your reaction' : 'React with ' + emoji}>
                          {emoji} <span className="text-[10px]">{count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compact hover toolbar sits outside the message bubble. */}
                {!selectMode && !isRecalled && (
                  <div className={`absolute top-0 z-20 flex items-center gap-1 rounded-xl border border-current/15 bg-slate-950/95 p-1 shadow-xl transition-opacity ${isTerminal ? '-top-2 -translate-y-full left-0' : `-top-2 -translate-y-full ${own ? 'right-0' : 'left-0'}`} ${activeToolbarFor === m.id ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto'}`}>
                    <button type="button" onClick={() => { setReplyTo(m); inputRef.current?.focus(); }} title="Reply" aria-label="Reply to message" className="rounded-lg p-1.5 hover:bg-white/10 hover:text-sky-300"><Reply size={13} /></button>
                    <div className="relative">
                      <button type="button" onClick={() => { setReactionMenuFor(reactionMenuFor === m.id ? null : m.id); setEmojiSearch(''); }} title="React" aria-label="React to message" className="rounded-lg p-1.5 hover:bg-white/10 hover:text-amber-300"><Smile size={13} /></button>
                      {reactionMenuFor === m.id && <div className="fixed left-1/2 top-1/2 z-[100] w-[min(22rem,calc(100vw-1rem))] max-h-[calc(100dvh-1rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-current/20 bg-slate-950 p-3 text-white shadow-2xl" onClick={(event) => event.stopPropagation()} onMouseEnter={() => setActiveToolbarFor(m.id)}>
                        <div className="mb-2 flex items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Quick reactions</span><button type="button" onClick={() => setEditingQuickEmojis((value) => !value)} className="text-[10px] text-sky-300 hover:text-sky-200">{editingQuickEmojis ? 'Done' : 'Customize'}</button></div>
                        <div className="mb-2 flex flex-wrap gap-1">{quickEmojis.map((emoji) => <button key={emoji} type="button" onClick={() => { if (editingQuickEmojis) setQuickEmojis((current) => current.filter((item) => item !== emoji)); else { void toggleReaction(m.id, emoji); setReactionMenuFor(null); } }} className="rounded-lg p-1.5 text-xl hover:bg-white/10" title={editingQuickEmojis ? 'Remove from quick bar' : `React ${emoji}`}>{emoji}</button>)}</div>
                        {editingQuickEmojis && <p className="mb-2 text-[10px] text-slate-500">Select emojis below to add or remove them from your quick bar.</p>}
                        <input value={emojiSearch} onChange={(event) => setEmojiSearch(event.target.value)} placeholder="Search emojis..." className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50" />
                        <div className="grid max-h-[min(52dvh,26rem)] grid-cols-8 gap-1 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">{UNIQUE_EMOJI_CATALOG.filter(([emoji, name]) => !emojiSearch || name.includes(emojiSearch.toLowerCase()) || emoji.includes(emojiSearch)).map(([emoji, name]) => <button key={`${emoji}-${name}`} type="button" onClick={() => { if (editingQuickEmojis) setQuickEmojis((current) => current.includes(emoji) ? current.filter((item) => item !== emoji) : [...current, emoji]); else { void toggleReaction(m.id, emoji); setReactionMenuFor(null); } }} className={`rounded-md p-1 text-lg hover:bg-white/15 ${quickEmojis.includes(emoji) ? 'bg-sky-500/20' : ''}`} title={name}>{emoji}</button>)}</div>
                      </div>}
                    </div>
                    {own && canEditMessage(m) && !isImage && !isVideo && !isFileCard && <button type="button" onClick={() => beginEdit(m)} title="Edit (within 24 hours)" aria-label="Edit message" className="rounded-lg p-1.5 hover:bg-white/10 hover:text-emerald-300"><Pencil size={13} /></button>}
                    {edits.some((edit) => edit.message_id === m.id) && <button type="button" onClick={() => setHistoryFor(historyFor === m.id ? null : m.id)} title="View edit history" aria-label="View edit history" className="rounded-lg p-1.5 hover:bg-white/10 hover:text-violet-300"><History size={13} /></button>}
                    <button type="button" onClick={() => void togglePin(m)} title={m.is_pinned ? 'Unpin' : 'Pin'} className="rounded-lg p-1.5 hover:bg-white/10 hover:text-amber-300">{m.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}</button>
                    {own && canRecallMessage(m) && <button type="button" onClick={() => void handleRecall(m.id)} title="Recall (within 7 days)" aria-label="Recall message" className="rounded-lg p-1.5 hover:bg-white/10 hover:text-sky-300"><RotateCcw size={13} /></button>}
                    <button type="button" onClick={() => handleLocalDelete(m.id)} title={t('deleteForMe')} className="rounded-lg p-1.5 hover:bg-white/10 hover:text-rose-400"><Trash2 size={13} /></button>
                  </div>
                )}
                {historyFor === m.id && (
                  <div className={`mt-2 w-full rounded-lg border p-2 text-xs ${isTerminal ? 'border-emerald-400/20 bg-black/30' : 'border-current/15 bg-black/10'}`}>
                    <div className="mb-1 font-semibold opacity-70">Edit history</div>
                    {edits.filter((edit) => edit.message_id === m.id).map((edit) => <div key={edit.id} className="border-t border-current/10 py-1.5"><div className="mb-0.5 text-[10px] opacity-50">{formatDateTime(edit.created_at)}</div><div className="whitespace-pre-wrap break-words">{parseReplyEnvelope(edit.old_content)?.message ?? edit.old_content}</div></div>)}
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
        <div className={`border-t p-3 sm:p-4 backdrop-blur-md relative z-20 ${isTerminal ? 'border-emerald-400/20 bg-black/35' : `${theme.border} ${theme.headerBg}`}`}>
          {replyTo && (
            <div className={`mb-3 flex items-center gap-3 rounded-xl border px-3 py-2 text-xs ${isTerminal ? 'border-emerald-400/25 bg-emerald-400/5' : 'border-pink-400/25 bg-pink-500/5'}`}>
              <Reply size={14} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold">Replying to {replyTo.sender_id === userId ? 'yourself' : 'message'}</div>
                <div className="truncate opacity-70">{summarizeReplyContent(replyTo.content)}</div>
              </div>
              <button type="button" onClick={() => setReplyTo(null)} className="rounded p-1 opacity-70 hover:opacity-100" aria-label="Cancel reply"><X size={14} /></button>
            </div>
          )}
          {sendError && (
            <div className={`mb-2 border px-4 py-2.5 text-xs shadow-sm ${isTerminal ? 'border-rose-400/30 bg-black/30 text-rose-300 rounded-md' : 'rounded-2xl bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
              ⚠️ {sendError}
            </div>
          )}
          <div className="flex items-center justify-between mb-3 px-2">
            <button
              onClick={() => setShowPinnedOnly((v) => !v)}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${isTerminal ? 'rounded-md border border-emerald-400/20 bg-emerald-400/5' : 'rounded-xl'} ${showPinnedOnly ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm' : 'bg-black/20 border border-current/15 opacity-80 hover:opacity-100'}`}
            >
              {showPinnedOnly ? `✨ ${t('showingPinned')}` : `📌 ${t('filterPinned')}`}
            </button>
            <span className="text-[11px] opacity-55">{isTerminal ? 'ENTER ↵ TO SEND' : t('pressEnter')}</span>
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
              className={`flex h-12 w-12 shrink-0 items-center justify-center border text-current opacity-70 hover:opacity-100 transition-all ${isTerminal ? 'rounded-md border-emerald-400/25 bg-emerald-400/5 hover:bg-emerald-400/10' : 'rounded-2xl border-current/20 bg-current/5 hover:bg-current/10 shadow-sm'}`}
            >
              <ImageIcon size={20} />
            </button>

            {/* Stickers Button */}
            <button
              type="button"
              onClick={() => setShowStickers(true)}
              title="Stickers"
              className={`flex h-12 w-12 shrink-0 items-center justify-center border text-current opacity-70 hover:opacity-100 transition-all ${isTerminal ? 'rounded-md border-emerald-400/25 bg-emerald-400/5 hover:bg-emerald-400/10' : 'rounded-2xl border-current/20 bg-current/5 hover:bg-current/10 shadow-sm'}`}
            >
              <Smile size={20} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isTerminal ? 'Type a message...' : t('placeholder')}
              maxLength={2000}
              autoComplete="off"
              className={`flex-1 border px-4 sm:px-5 py-3.5 text-sm outline-none transition-all placeholder:opacity-35 ${isTerminal ? 'rounded-md border-emerald-400/25 bg-black/35 font-mono focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/10' : `rounded-2xl border-current/20 ${theme.inputBg} focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 shadow-inner`}`}
              style={isTerminal ? { color: terminalPalette.primaryText } : undefined}
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className={`flex h-12 w-12 shrink-0 items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${isTerminal ? 'rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md shadow-purple-500/25'}`}
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
        </div>
      </div>
    );
  }