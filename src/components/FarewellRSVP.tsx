import { useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, ArrowLeft, Calendar, Utensils, Languages, Check, X, Sprout, Cherry } from 'lucide-react'
import { SITE } from '../config/site'
import type { FarewellRsvp, EntityId } from '../types/api'

/**
 * FarewellRSVP — route /farewell.
 *
 *  1. Anti-spam: after a successful submit we set localStorage `mtn_farewell_planted`.
 *     On mount, if it's set, we skip the form and show a "thank you" card instead.
 *  2. A single pre-selected "Friendship Sakura" card (visual only — plantType is
 *     always sent as 'sakura').
 *  3. Smart branching — "Can you join the party?" Yes shows all fields; No hides
 *     dates + food (everyone can still plant a tree).
 *  4. 8-language i18n (EN/JA/MY/VI/ID/ZH/NE/MN).
 *
 * On submit it POSTs to /api/farewell/rsvp, stashes the returned monument under
 * localStorage['mtn_pending_plant'], and redirects to /sanctuary.
 */
const API = `${SITE.apiUrl}/api/farewell/rsvp`
const PENDING_KEY = 'mtn_pending_plant'
const PLANTED_FLAG = 'mtn_farewell_planted'   // one submission per device

function getOperatorId(): string {
  try {
    let id = localStorage.getItem('mtn_operator_id')
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `op-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem('mtn_operator_id', id)
    }
    return id
  } catch { return `op-${Date.now()}` }
}

// ───────────────────────── 8-language dictionary ─────────────────────────
interface LangOption { code: string; label: string }
const LANGS: LangOption[] = [
  { code: 'en', label: 'EN' }, { code: 'ja', label: '日本語' }, { code: 'my', label: 'မြန်မာ' },
  { code: 'vi', label: 'VI' }, { code: 'id', label: 'ID' }, { code: 'zh', label: '中文' },
  { code: 'ne', label: 'नेपाली' }, { code: 'mn', label: 'MN' },
]

const T: Record<string, Record<string, string>> = {
  en: {
    title: 'Plant a Living Memory for ナイン',
    subtitle: 'Thank you for your friendship and the lasting memories we share. As a token of our bond, I invite you to plant a Friendship Cherry Blossom tree in this little 3D world, along with a memorable message.',
    joinQ: 'Can you join the farewell party?',
    joinYes: "Yes, I'll join", joinNo: "No, but I'll leave a memory",
    plant: 'Choose your plant', sakura: 'Friendship Sakura', sakuraSub: 'Cherry blossom — a beautiful symbol of our friendship',
    name: 'Your name', namePh: 'e.g. Aiko Tanaka',
    dates: 'Dates available', datesPh: 'e.g. Jul 4, Jul 6 (Latest: 13.7.2026)',
    food: 'Food preference', foodPh: 'e.g. Vegetarian / No pork',
    message: 'Farewell message', messagePh: "A few words you'd like to leave behind…",
    submit: 'Plant & Enter the Sanctuary', submitting: 'Planting…',
    footer: 'One living monument per person · editable anytime',
    offline: "We couldn't reach the server, but your plant will still grow now and sync later.",
    skip: 'Skip to Sanctuary',
    done: 'You have already planted your memory tree. Thank you!', enter: 'Enter the Sanctuary',
  },
  ja: {
    title: 'ナインへ 思い出の木を植えよう',
    subtitle: 'これまでの友情と、共に重ねた思い出に心から感謝します。私たちの絆のしるしとして、この小さな3Dの世界に「友情の桜」を、心に残るメッセージとともに植えていただけませんか。',
    joinQ: '送別会に参加できますか？',
    joinYes: 'はい、参加します', joinNo: 'いいえ、でも思い出を残します',
    plant: '植物を選ぶ', sakura: '友情の桜', sakuraSub: '桜 — 私たちの友情の美しい象徴',
    name: 'お名前', namePh: '例：田中 愛子',
    dates: '参加可能な日', datesPh: '例：7月4日、6日（締切：2026年7月13日）',
    food: '食べ物の希望', foodPh: '例：ベジタリアン／豚肉なし',
    message: '送別メッセージ', messagePh: '残したい一言を…',
    submit: '植えてサンクチュアリへ', submitting: '植えています…',
    footer: '一人につき一つの記念樹 · いつでも編集可能',
    offline: 'サーバーに接続できませんでしたが、木は今すぐ育ち、後で同期されます。',
    skip: 'サンクチュアリへスキップ',
    done: 'すでに思い出の木を植えていただきました。ありがとうございます！', enter: 'サンクチュアリへ入る',
  },
  my: {
    title: 'ナインအတွက် အမှတ်တရ သစ်ပင်စိုက်ပါ',
    subtitle: 'ခင်မင်ရင်းနှီးခဲ့ရတဲ့အတွက် အမြဲတမ်းအမှတ်တရနဲ့ ကျေးဇူးတင်ရှိပါတယ်။ ခင်မင်ရင်းနှီးမှု အမှတ်တရအတွက် 3D ကမ္ဘာလေးထဲမှာ မိတ်ဆွေဖြစ်ချယ်ရီပင်လေးကို အမှတ်တရစာလေးနဲ့အတူ စိုက်ပျိုးခဲ့ပေးဖို့ တောင်းဆိုပါတယ်။',
    joinQ: 'နှုတ်ဆက်ပွဲသို့ တက်ရောက်နိုင်ပါသလား?',
    joinYes: 'ဟုတ်ကဲ့၊ တက်ရောက်ပါမည်', joinNo: 'မတက်နိုင်ပါ၊ ဒါပေမယ့် အမှတ်တရ ချန်ထားမည်',
    plant: 'သင့်အပင်ကို ရွေးပါ', sakura: 'မိတ်ဆွေဖြစ် ချယ်ရီပင်', sakuraSub: 'ချယ်ရီပန်း — ကျွန်ုပ်တို့၏ ခင်မင်ရင်းနှီးမှု၏ လှပသော သင်္ကေတ',
    name: 'သင့်အမည်', namePh: 'ဥပမာ - အိကို တာနာကာ',
    dates: 'အားလပ်သည့်ရက်များ', datesPh: 'ဥပမာ - ဇူလိုင် ၄၊ ၆ (နောက်ဆုံး - ၁၃.၇.၂၀၂၆)',
    food: 'အစားအစာ ရွေးချယ်မှု', foodPh: 'ဥပမာ - သက်သတ်လွတ် / ဝက်သားမပါ',
    message: 'နှုတ်ဆက်စကား', messagePh: 'ချန်ထားလိုသော စကားအနည်းငယ်…',
    submit: 'စိုက်ပျိုးပြီး Sanctuary သို့ဝင်ပါ', submitting: 'စိုက်ပျိုးနေသည်…',
    footer: 'တစ်ဦးလျှင် အမှတ်တရ တစ်ခု · အချိန်မရွေး ပြင်ဆင်နိုင်သည်',
    offline: 'ဆာဗာသို့ မချိတ်ဆက်နိုင်သော်လည်း သင့်အပင် ယခု ကြီးထွားမည်ဖြစ်ပြီး နောက်မှ ထပ်တူပြုပါမည်။',
    skip: 'Sanctuary သို့ ကျော်သွားရန်',
    done: 'သင် အမှတ်တရ သစ်ပင်ကို စိုက်ပျိုးပြီးဖြစ်ပါသည်။ ကျေးဇူးတင်ပါသည်!', enter: 'Sanctuary သို့ ဝင်ရန်',
  },
  vi: {
    title: 'Trồng một kỷ niệm sống cho ナイン',
    subtitle: 'Cảm ơn tình bạn của bạn và những kỷ niệm bền lâu mà chúng ta cùng chia sẻ. Như một biểu tượng cho tình bạn của chúng ta, tôi mời bạn trồng một cây Hoa Anh Đào Tình Bạn trong thế giới 3D nhỏ bé này, kèm theo một lời nhắn đáng nhớ.',
    joinQ: 'Bạn có thể tham gia tiệc chia tay không?',
    joinYes: 'Có, tôi sẽ tham gia', joinNo: 'Không, nhưng tôi sẽ để lại kỷ niệm',
    plant: 'Chọn cây của bạn', sakura: 'Hoa anh đào tình bạn', sakuraSub: 'Hoa anh đào — biểu tượng đẹp đẽ cho tình bạn của chúng ta',
    name: 'Tên của bạn', namePh: 'ví dụ: Aiko Tanaka',
    dates: 'Ngày có thể tham gia', datesPh: 'ví dụ: 4/7, 6/7 (Hạn chót: 13.7.2026)',
    food: 'Sở thích ăn uống', foodPh: 'ví dụ: Ăn chay / Không thịt heo',
    message: 'Lời chia tay', messagePh: 'Vài lời bạn muốn để lại…',
    submit: 'Trồng cây & Vào Thánh địa', submitting: 'Đang trồng…',
    footer: 'Mỗi người một đài tưởng niệm · có thể chỉnh sửa bất cứ lúc nào',
    offline: 'Chúng tôi không thể kết nối máy chủ, nhưng cây của bạn vẫn sẽ mọc ngay và đồng bộ sau.',
    skip: 'Bỏ qua đến Thánh địa',
    done: 'Bạn đã trồng cây kỷ niệm của mình rồi. Cảm ơn bạn!', enter: 'Vào Thánh địa',
  },
  id: {
    title: 'Tanam Kenangan Hidup untuk ナイン',
    subtitle: 'Terima kasih atas persahabatan dan kenangan abadi yang kita bagikan. Sebagai tanda ikatan kita, saya mengundangmu menanam pohon Sakura Persahabatan di dunia 3D kecil ini, beserta sebuah pesan yang berkesan.',
    joinQ: 'Bisakah kamu hadir di pesta perpisahan?',
    joinYes: 'Ya, saya hadir', joinNo: 'Tidak, tapi saya tinggalkan kenangan',
    plant: 'Pilih tanamanmu', sakura: 'Sakura Persahabatan', sakuraSub: 'Bunga sakura — simbol indah persahabatan kita',
    name: 'Namamu', namePh: 'mis. Aiko Tanaka',
    dates: 'Tanggal tersedia', datesPh: 'mis. 4 Jul, 6 Jul (Paling lambat: 13.7.2026)',
    food: 'Preferensi makanan', foodPh: 'mis. Vegetarian / Tanpa babi',
    message: 'Pesan perpisahan', messagePh: 'Beberapa kata yang ingin kamu tinggalkan…',
    submit: 'Tanam & Masuki Sanctuary', submitting: 'Menanam…',
    footer: 'Satu monumen hidup per orang · bisa diedit kapan saja',
    offline: 'Kami tidak dapat menghubungi server, tetapi tanamanmu tetap akan tumbuh sekarang dan disinkronkan nanti.',
    skip: 'Lewati ke Sanctuary',
    done: 'Kamu sudah menanam pohon kenanganmu. Terima kasih!', enter: 'Masuki Sanctuary',
  },
  zh: {
    title: '为 ナイン 种下一段活的回忆',
    subtitle: '感谢你的友谊以及我们共同拥有的美好回忆。作为我们情谊的象征，我邀请你在这个小小的3D世界里种下一棵友谊樱花树，并留下一段难忘的留言。',
    joinQ: '你能参加欢送会吗？',
    joinYes: '可以，我会参加', joinNo: '不能，但我要留下回忆',
    plant: '选择你的植物', sakura: '友谊樱花', sakuraSub: '樱花 — 我们友谊的美丽象征',
    name: '你的名字', namePh: '例如：田中爱子',
    dates: '可参加的日期', datesPh: '例如：7月4日、6日（截止：2026.7.13）',
    food: '饮食偏好', foodPh: '例如：素食 / 不吃猪肉',
    message: '告别留言', messagePh: '想留下的几句话…',
    submit: '种植并进入圣所', submitting: '种植中…',
    footer: '每人一座活的纪念碑 · 随时可编辑',
    offline: '无法连接服务器，但你的植物现在仍会生长，稍后同步。',
    skip: '跳转到圣所',
    done: '你已经种下了你的回忆之树。谢谢你！', enter: '进入圣所',
  },
  ne: {
    title: 'ナインका लागि जीवित सम्झना रोप्नुहोस्',
    subtitle: 'तपाईंको मित्रता र हामीले साझा गरेका अमिट सम्झनाहरूका लागि धन्यवाद। हाम्रो सम्बन्धको प्रतीकका रूपमा, म तपाईंलाई यो सानो 3D संसारमा एउटा मित्रता चेरी ब्लोसम रूख एउटा यादगार सन्देशसहित रोप्न निमन्त्रणा गर्दछु।',
    joinQ: 'के तपाईं विदाई पार्टीमा सहभागी हुन सक्नुहुन्छ?',
    joinYes: 'हो, म सहभागी हुन्छु', joinNo: 'होइन, तर म सम्झना छोड्छु',
    plant: 'आफ्नो बिरुवा छान्नुहोस्', sakura: 'मित्रता साकुरा', sakuraSub: 'चेरी फूल — हाम्रो मित्रताको सुन्दर प्रतीक',
    name: 'तपाईंको नाम', namePh: 'जस्तै: Aiko Tanaka',
    dates: 'उपलब्ध मितिहरू', datesPh: 'जस्तै: जुलाई ४, ६ (अन्तिम: 13.7.2026)',
    food: 'खानाको रुचि', foodPh: 'जस्तै: शाकाहारी / सुँगुर बाहेक',
    message: 'विदाई सन्देश', messagePh: 'छोड्न चाहनुभएको केही शब्द…',
    submit: 'रोप्नुहोस् र Sanctuary भित्र जानुहोस्', submitting: 'रोप्दै…',
    footer: 'प्रति व्यक्ति एउटा जीवित स्मारक · जहिले पनि सम्पादन गर्न सकिने',
    offline: 'हामी सर्भरमा पुग्न सकेनौं, तर तपाईंको बिरुवा अहिले नै बढ्नेछ र पछि सिङ्क हुनेछ।',
    skip: 'Sanctuary मा जानुहोस्',
    done: 'तपाईंले आफ्नो सम्झनाको रूख रोपिसक्नुभयो। धन्यवाद!', enter: 'Sanctuary भित्र जानुहोस्',
  },
  mn: {
    title: 'ナイン-д зориулж амьд дурсамж тарь',
    subtitle: 'Найрсал болон бидний хуваалцсан мөнхийн дурсамжуудад чин сэтгэлээсээ талархаж байна. Бидний холбооны бэлгэдэл болгон энэ жижигхэн 3D ертөнцөд Найрамдлын Сакура модыг дурсгалт захидлын хамт тарихыг урьж байна.',
    joinQ: 'Та үдэлтийн үдэшлэгт оролцож чадах уу?',
    joinYes: 'Тийм, би оролцоно', joinNo: 'Үгүй, гэхдээ дурсамж үлдээнэ',
    plant: 'Ургамлаа сонго', sakura: 'Найрамдлын сакура', sakuraSub: 'Интоорын цэцэг — бидний найрамдлын үзэсгэлэнт бэлгэдэл',
    name: 'Таны нэр', namePh: 'ж: Айко Танака',
    dates: 'Боломжтой өдрүүд', datesPh: 'ж: 7-р сарын 4, 6 (Эцсийн хугацаа: 2026.7.13)',
    food: 'Хоолны сонголт', foodPh: 'ж: Цагаан хоолтон / Гахайн махгүй',
    message: 'Үдэлтийн үг', messagePh: 'Үлдээхийг хүссэн хэдэн үг…',
    submit: 'Тарьж Sanctuary руу орох', submitting: 'Тарьж байна…',
    footer: 'Хүн бүрт нэг амьд дурсгал · хэдийд ч засварлах боломжтой',
    offline: 'Сервертэй холбогдож чадсангүй, гэхдээ таны ургамал одоо ургаж, дараа нь синк хийгдэнэ.',
    skip: 'Sanctuary руу алгасах',
    done: 'Та дурсамжийн модоо аль хэдийн тарьсан байна. Баярлалаа!', enter: 'Sanctuary руу орох',
  },
}

const inputCls = 'mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15 sm:py-2.5 sm:text-sm'

// Shared full-screen shell — guarantees smooth vertical scrolling on every phone.
function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#070b1c] via-[#141a38] to-[#2a1a3a]"
        style={{ backgroundImage: 'radial-gradient(1px 1px at 14% 20%, #fff, transparent), radial-gradient(1px 1px at 30% 34%, #fff, transparent), radial-gradient(1.5px 1.5px at 47% 14%, #fff, transparent), radial-gradient(1px 1px at 65% 28%, #fff, transparent), radial-gradient(1px 1px at 80% 16%, #fff, transparent), radial-gradient(1.5px 1.5px at 90% 32%, #fff, transparent), linear-gradient(to bottom, #070b1c, #141a38, #2a1a3a)' }} />
      <div className="relative h-[100dvh] w-screen overflow-y-auto overscroll-contain font-sans"
        style={{ WebkitOverflowScrolling: 'touch', WebkitTapHighlightColor: 'transparent' }}>
        <div className="flex min-h-[100dvh] w-full flex-col px-4 pt-12"
          style={{ paddingBottom: 'max(8rem, calc(env(safe-area-inset-bottom) + 6rem))' }}>
          <div className="m-auto w-full max-w-lg">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

function LangBar({ lang, setLang }: { lang: string; setLang: (code: string) => void }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5">
      <Languages size={14} className="mr-0.5 text-white/50" />
      {LANGS.map((l) => (
        <button key={l.code} type="button" onClick={() => setLang(l.code)}
          className={`min-h-[30px] rounded-full px-2.5 py-1 font-mono text-[11px] transition ${lang === l.code ? 'bg-amber-300/80 text-amber-950' : 'border border-white/15 bg-white/5 text-white/70 hover:bg-white/10'}`}>
          {l.label}
        </button>
      ))}
    </div>
  )
}

// The monument we stash for the Sanctuary to render — either an optimistic
// offline placeholder (position null) or the server-assigned plot.
interface PlantedMonument {
  id?: EntityId
  name: string
  plantType: string
  position: number[] | null
}

// What /api/farewell/rsvp returns (plus an optional error message field).
type FarewellResponse = Partial<FarewellRsvp> & { message?: string }

export default function FarewellRSVP() {
  const navigate = useNavigate()
  const operatorId = useRef(getOperatorId()).current

  const [lang, setLang] = useState<string>(() => { try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' } })
  useEffect(() => { try { localStorage.setItem('mtn_lang', lang) } catch { /* ignore */ } }, [lang])
  const t = T[lang] || T.en

  // Anti-spam: one submission per device.
  const [alreadyPlanted] = useState<boolean>(() => { try { return localStorage.getItem(PLANTED_FLAG) === 'true' } catch { return false } })

  const [attending, setAttending] = useState<boolean | null>(null)   // null | true | false
  const [name, setName] = useState('')
  const [dates, setDates] = useState('')
  const [food, setFood] = useState('')
  const [message, setMessage] = useState('')
  // Visual-only "tap" feedback on the (single) Sakura card; payload is always 'sakura'.
  const [plantPulse, setPlantPulse] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (attending === null || !name.trim() || !message.trim() || submitting) return
    setSubmitting(true); setError('')

    const payload = {
      attending,
      name: name.trim(),
      datesAvailable: attending ? dates.trim() : '',
      foodPreference: attending ? food.trim() : '',
      message: message.trim(),
      plantType: 'sakura',                    // every monument is the Friendship Sakura
    }

    let planted: PlantedMonument = { name: payload.name, plantType: 'sakura', position: null }
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Operator-Token': operatorId },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = (await res.json().catch(() => null)) as FarewellResponse | null
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)
      if (data?.position && typeof data.position.x === 'number') {
        planted = { id: data.id, name: data.name || payload.name, plantType: 'sakura', position: [data.position.x, data.position.y, data.position.z] }
      }
    } catch (err) {
      console.error('[Farewell] RSVP POST failed:', err)
      setError('offline')
    }

    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify({ ...planted, ts: Date.now() }))
      localStorage.setItem(PLANTED_FLAG, 'true')   // lock this device to one submission
    } catch { /* ignore */ }
    navigate('/sanctuary')
  }

  // ── Already planted → thank-you card (no form) ──
  if (alreadyPlanted) {
    return (
      <Shell>
        <motion.div initial={{ scale: 0.94, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="relative mx-auto w-full max-w-md rounded-[28px] border border-white/25 bg-white/15 p-8 text-center text-white shadow-2xl backdrop-blur-2xl">
          <LangBar lang={lang} setLang={setLang} />
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-amber-300 text-emerald-950 shadow-[0_0_28px_rgba(110,231,183,0.6)]">
            <Sprout size={26} />
          </div>
          <p className="mx-auto max-w-sm font-serif text-lg leading-relaxed text-white/90">{t.done}</p>
          <Link to="/sanctuary" className="mx-auto mt-7 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-rose-300 px-6 py-3 font-serif text-sm font-bold text-amber-950 shadow-lg transition hover:brightness-105">
            {t.enter} <ArrowLeft size={15} className="rotate-180" />
          </Link>
        </motion.div>
      </Shell>
    )
  }

  return (
    <Shell>
      <Link to="/sanctuary" className="fixed left-4 z-10 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 bg-black/40 px-4 py-2 font-mono text-xs text-white/90 backdrop-blur-md transition hover:bg-black/60"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
        <ArrowLeft size={15} /> {t.skip}
      </Link>

      <motion.form
        onSubmit={submit}
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="relative w-full max-w-lg rounded-[28px] border border-white/25 bg-white/15 p-6 text-white shadow-2xl backdrop-blur-2xl sm:p-8"
      >
        <LangBar lang={lang} setLang={setLang} />

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-300 text-amber-950 shadow-[0_0_24px_rgba(253,224,140,0.6)]">
          <Sparkles size={22} />
        </div>
        <h1 className="text-center font-serif text-2xl font-bold tracking-wide sm:text-3xl">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-center font-serif text-[14px] leading-relaxed text-white/85">{t.subtitle}</p>

        {/* Step 1 — attendance branch */}
        <div className="mt-6">
          <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.joinQ}</span>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setAttending(true)}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 font-serif text-sm font-semibold transition ${attending === true ? 'border-emerald-300/80 bg-emerald-300/20 text-emerald-100 ring-1 ring-emerald-200/50' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'}`}>
              <Check size={16} /> {t.joinYes}
            </button>
            <button type="button" onClick={() => setAttending(false)}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 font-serif text-sm font-semibold transition ${attending === false ? 'border-rose-300/80 bg-rose-300/20 text-rose-100 ring-1 ring-rose-200/50' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'}`}>
              <X size={16} /> {t.joinNo}
            </button>
          </div>
        </div>

        {/* Step 2 — fields appear after a choice */}
        <AnimatePresence initial={false}>
          {attending !== null && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
              {/* Plant choice — single, pre-selected Friendship Sakura card */}
              <div className="mt-5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.plant}</span>
                <button type="button" aria-pressed="true"
                  onClick={() => { setPlantPulse(true); setTimeout(() => setPlantPulse(false), 220) }}
                  className={`mt-2 flex w-full items-center gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-rose-300/15 to-amber-300/15 px-4 py-3 text-left ring-1 ring-amber-200/60 shadow-[0_0_26px_rgba(251,191,153,0.35)] transition ${plantPulse ? 'scale-[0.98]' : 'scale-100'}`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-amber-300 text-rose-950 shadow-[0_0_18px_rgba(251,191,153,0.7)]">
                    <Cherry size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-sm font-semibold leading-tight">{t.sakura}</span>
                    <span className="mt-0.5 block font-mono text-[10px] leading-snug text-white/70">{t.sakuraSub}</span>
                  </span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-300 text-amber-950">
                    <Check size={14} />
                  </span>
                </button>
              </div>

              <label className="mt-5 block">
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.name}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required placeholder={t.namePh} className={inputCls} />
              </label>

              {/* Dates + Food only when attending */}
              <AnimatePresence initial={false}>
                {attending === true && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                    <label className="mt-4 block">
                      <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-200/80"><Calendar size={12} /> {t.dates}</span>
                      <input value={dates} onChange={(e) => setDates(e.target.value)} maxLength={120} placeholder={t.datesPh} className={inputCls} />
                    </label>
                    <label className="mt-4 block">
                      <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-200/80"><Utensils size={12} /> {t.food}</span>
                      <input value={food} onChange={(e) => setFood(e.target.value)} maxLength={80} placeholder={t.foodPh} className={inputCls} />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="mt-4 block">
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.message}</span>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} required rows={3} placeholder={t.messagePh} className={`${inputCls} resize-none`} />
                <span className="mt-1 block text-right font-mono text-[10px] text-white/40">{message.length}/240</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {error === 'offline' && (
          <p className="mt-3 rounded-xl border border-amber-300/40 bg-black/40 px-3 py-2 font-mono text-[11px] text-amber-200/90">{t.offline}</p>
        )}

        <button type="submit" disabled={submitting || attending === null}
          className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-rose-300 px-5 py-3 font-serif text-sm font-bold text-amber-950 shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50">
          {submitting ? t.submitting : t.submit} <Send size={15} />
        </button>
        <p className="mt-3 text-center font-mono text-[10px] text-white/45">{t.footer}</p>
      </motion.form>
    </Shell>
  )
}
