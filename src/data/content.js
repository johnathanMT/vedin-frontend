import { SITE } from '../config/site'
import { ASSETS } from '../config/assets'

export const PERSONAL = {
  name: 'Myo Thant Naing',
  handle: 'MTN.Digitosphere',
  tagline: 'From Caring to Coding in Japan 🇯🇵',
  subtitle: 'Computer Science Student · Care-giver · Aspiring AI Engineer',
  bio: 'Living in Japan. Transforming from Healthcare to Tech. I build software to solve real-world problems.',
  slogan: 'Better Late Than Never',
  email: SITE.email,
  // Bundled via src/assets (Vite hashes it + fixes the URL for any domain).
  photo: ASSETS.profile,
  photoWebp: ASSETS.profileWebp,
  quote: "Don't Be Institutionalized, Be the Architect of Your Environment.",
  heinlein: `"A human being should be able to change a diaper, plan an invasion, butcher a hog, conn a ship, design a building, write a sonnet, balance accounts, build a wall, set a bone, comfort the dying, take orders, give orders, cooperate, act alone, solve equations, analyze a new problem, pitch manure, program a computer, cook a tasty meal, fight efficiently, die gallantly. Specialization is for insects." – Robert A. Heinlein`,
}

// Real, personal channels only. The LINE link is intentionally NOT here — it
// reaches an automated AI assistant, not me personally (see the AI-agent section).
export const SOCIAL = [
  { label: 'GitHub', icon: 'fab fa-github', url: 'https://github.com/johnathanMT' },
  { label: 'LinkedIn', icon: 'fab fa-linkedin-in', url: 'https://www.linkedin.com/in/myothantnaing' },
]

export const SKILLS = [
  { name: 'AI & Agentic AI', icon: 'fas fa-brain', color: '#e84ad5' },      // neon magenta
  { name: 'Python', icon: 'fab fa-python', color: '#22d3ee' },              // electric cyan
  { name: 'C#', icon: 'fas fa-code', color: '#a855f7' },                    // neon violet
  { name: 'HTML / CSS', icon: 'fab fa-html5', color: '#fb4158' },           // glowing red
  { name: 'JavaScript', icon: 'fab fa-js', color: '#facc15' },              // bright yellow
  { name: 'Japanese', icon: 'fas fa-language', color: '#f472e3' },          // neon pink
  { name: 'Kaigo Care', icon: 'fas fa-hands-helping', color: '#38bdf8' },   // sky
  { name: 'English', icon: 'fas fa-globe-americas', color: '#2dd4bf' },     // teal
  { name: 'UI / UX', icon: 'fas fa-pen-nib', color: '#c084fc' },            // violet
  { name: 'IoT (M5Stack)', icon: 'fas fa-microchip', color: '#34d399' },    // neon green
  { name: 'Software Engineering', icon: 'fas fa-laptop-code', color: '#60a5fa' }, // blue

]

export const PROJECTS = [
  {
    id: 'python', title: 'Python Automation',
    desc: 'Tools created to help with daily tasks and workflows.',
    icon: 'fab fa-python', color: '#3b82f6',
    url: '/python', ext: false,             // journey hub — React route
  },
  {
    id: 'studying', title: 'Personal Studying',
    desc: 'NCC Diploma, IBM AI certs, and university coursework — the reading room of my CS path.',
    icon: 'fas fa-laptop-code', color: '#a855f7',
    url: '/studying', ext: false,           // journey hub — React route
  },
  {
    id: 'bibliography', title: 'Bibliography',
    desc: 'A chronological journey — from Myanmar to Japan, caregiving to Computer Science.',
    icon: 'fas fa-book', color: '#06b6d4',
    url: '/bibliography', ext: false,       // journey hub — React route
  },
  {
    id: 'coffee', title: 'Bean Boutique Coffee Shop',
    desc: 'A modern website showcasing premium coffee beans and brewing equipment.',
    icon: 'fas fa-coffee', color: '#f59e0b',
    url: SITE.coffeeUrl, ext: true, featured: true,
  },
  {
    id: 'github', title: 'GitHub Projects',
    desc: 'AI bots, IoT, full-stack web apps, and automation scripts — all repositories in one place.',
    icon: 'fab fa-github', color: '#e2e2f0',
    url: '/github', ext: false,
  },
  {
    id: 'vedin', title: 'Vedin — Vedic Astrology',
    desc: 'A sidereal Vedic astrology portal — Rasi & Navamsa charts, Vimshottari dasha, a whole-life timeline and Shadbala strengths.',
    icon: 'fas fa-star-and-crescent', color: '#eab308',
    url: '/vedin', ext: false,             // in-app React route
  },
]

// The 12 BURMESE LUNAR MONTHS and their signature festivals (calendar order,
// Tagu → Tabaung). `file` is the image slug in src/assets/images/months/
// (e.g. tangoo.webp); SeasonalGallery binds it automatically via import.meta.glob.
// `greg` = approximate Gregorian span. Missing images fall back to a placeholder.
//  `festival` and `desc` are i18n objects ({ en, mm, jp, zh, vn, ne, id }).
//  SeasonalGallery picks the active language and falls back to `en` per key.
export const MONTHS = [
  {
    name: 'Tagu', mm: 'တန်ခူး', greg: 'Mar–Apr', region: 'Nationwide', color: '#bbf7d0', file: 'tangoo',
    festival: { en: 'Thingyan Water Festival', mm: 'သင်္ကြန် ရေသဘင်ပွဲတော်', jp: 'ティンジャン（水祭り）', zh: '泼水节（缅甸新年）', vn: 'Lễ hội té nước Thingyan', ne: 'थिङ्ग्यान जल महोत्सव', id: 'Festival Air Thingyan' },
    desc: {
      en: 'The joyous New-Year water festival washes away the old year across Myanmar.',
      mm: 'နှစ်သစ်ကို ကြိုဆိုသည့် ပျော်ရွှင်ဖွယ် ရေပက်ပွဲတော်ဖြင့် တစ်နိုင်ငံလုံး စိုစွတ်သွားသည်။',
      jp: '新年を迎える楽しい水祭りで、ミャンマー全土が水に包まれます。',
      zh: '欢乐的新年泼水节，洗去旧岁，遍及全缅甸。',
      vn: 'Lễ hội té nước mừng năm mới rộn ràng khắp Myanmar, gột rửa năm cũ.',
      ne: 'नयाँ वर्ष स्वागत गर्ने रमाइलो जल महोत्सवले पूरै म्यानमारलाई भिजाउँछ।',
      id: 'Festival air Tahun Baru yang meriah membasuh tahun lama di seluruh Myanmar.',
    },
  },
  {
    name: 'Kason', mm: 'ကဆုန်', greg: 'Apr–May', region: 'Nationwide', color: '#a7f3d0', file: 'kasone',
    festival: { en: 'Kason Bodhi-Tree Watering', mm: 'ကဆုန် ညောင်ရေသွန်းပွဲ', jp: 'カソン 菩提樹潅水祭（ウェーサーカ）', zh: '卡颂 菩提树浇水节（卫塞节）', vn: 'Lễ tưới cây Bồ Đề Kason', ne: 'कासोन बोधिवृक्ष सिँचाइ (वेसाक)', id: 'Penyiraman Pohon Bodhi Kason (Waisak)' },
    desc: {
      en: 'On the full moon, devotees pour scented water at the foot of the sacred Bodhi tree (Vesak).',
      mm: 'လပြည့်နေ့၌ ဘုရားပွင့်တော်မူရာ ဗောဓိညောင်ပင်ကို ရေမွှေးဖြင့် သွန်းလောင်းပူဇော်ကြသည်။',
      jp: '満月の日、信者たちが聖なる菩提樹に香水を注ぎます（ウェーサーカ祭）。',
      zh: '满月之日，信众向神圣的菩提树根浇灌香水（卫塞节）。',
      vn: 'Vào ngày rằm, tín đồ tưới nước thơm dưới gốc cây Bồ Đề thiêng (Lễ Vesak).',
      ne: 'पूर्णिमाको दिन भक्तजनहरूले पवित्र बोधिवृक्षको फेदमा सुगन्धित पानी चढाउँछन्।',
      id: 'Saat purnama, umat menyiramkan air wangi di kaki pohon Bodhi suci (Waisak).',
    },
  },
  {
    name: 'Nayon', mm: 'နယုန်', greg: 'May–Jun', region: 'Monasteries', color: '#a5f3fc', file: 'nayone',
    festival: { en: 'Tipiṭaka Recitation Exams', mm: 'နယုန် ပိဋကတ် စာမေးပွဲ', jp: 'ナヨン 三蔵経試験', zh: '纳永 三藏经诵考', vn: 'Kỳ thi tụng Tam Tạng Nayon', ne: 'नायोन त्रिपिटक परीक्षा', id: 'Ujian Pembacaan Tipiṭaka Nayon' },
    desc: {
      en: 'Monks sit the great scriptural examinations, reciting the Tipiṭaka from memory.',
      mm: 'ဘုန်းတော်ကြီးများ ပိဋကတ်တော်ကို အာဂုံဆောင် ရွတ်ဖတ်၍ ကြီးကျယ်သော စာမေးပွဲများ ဖြေဆိုကြသည်။',
      jp: '僧侶たちが三蔵経を暗誦し、盛大な経典試験に臨みます。',
      zh: '僧侣们凭记忆背诵三藏经，参加盛大的经典考试。',
      vn: 'Chư tăng dự kỳ thi kinh điển lớn, tụng thuộc lòng Tam Tạng.',
      ne: 'भिक्षुहरूले त्रिपिटक कण्ठ गरी महान् धर्मग्रन्थ परीक्षा दिन्छन्।',
      id: 'Para biksu mengikuti ujian kitab besar, melafalkan Tipiṭaka dari ingatan.',
    },
  },
  {
    name: 'Waso', mm: 'ဝါဆို', greg: 'Jun–Jul', region: 'Nationwide', color: '#fde68a', file: 'waso',
    festival: { en: 'Waso — Start of Buddhist Lent', mm: 'ဝါဆို (ဝါတွင်းအစ)', jp: 'ワソー（雨安居の始まり）', zh: '瓦梭（结夏安居开始）', vn: 'Waso — Bắt đầu Mùa An Cư', ne: 'वासो — वर्षावासको सुरुवात', id: 'Waso — Awal Masa Vassa' },
    desc: {
      en: 'Offering Waso robes and Waso flowers marks the start of the three-month Vassa retreat.',
      mm: 'ဝါဆိုသင်္ကန်းနှင့် ဝါဆိုပန်းများ ကပ်လှူခြင်းဖြင့် သုံးလတာ ဝါတွင်းကာလ စတင်သည်။',
      jp: 'ワソー法衣とワソーの花を捧げ、3か月の雨安居が始まります。',
      zh: '供奉瓦梭袈裟与瓦梭花，标志三个月雨安居的开始。',
      vn: 'Dâng y Waso và hoa Waso đánh dấu khởi đầu mùa an cư ba tháng.',
      ne: 'वासो चीवर र वासो फूल चढाएर तीन महिने वर्षावास सुरु हुन्छ।',
      id: 'Persembahan jubah Waso dan bunga Waso menandai awal retret Vassa tiga bulan.',
    },
  },
  {
    name: 'Wagaung', mm: 'ဝါခေါင်', greg: 'Jul–Aug', region: 'near Mandalay', color: '#fcd34d', file: 'wakhaung',
    festival: { en: 'Taungbyone Nat Festival', mm: 'ဝါခေါင် တောင်ပြုန်း နတ်ပွဲ', jp: 'ワガウン タウンビョン精霊祭', zh: '瓦冈 当卑温神灵节', vn: 'Lễ hội Thần linh Taungbyone', ne: 'तौङब्योन नत् पर्व', id: 'Festival Roh Taungbyone' },
    desc: {
      en: 'The most famous spirit (nat) festival — a week of music, offerings and devotion.',
      mm: 'အကျော်ကြားဆုံး နတ်ပွဲတော် — ဂီတ၊ ပူဇော်ပွဲနှင့် ကြည်ညိုမှုဖြင့် တစ်ပတ်တာ ကျင်းပသည်။',
      jp: '最も有名な精霊（ナッ）祭り。音楽と供物、信仰の一週間。',
      zh: '最著名的神灵（Nat）节庆 —— 一周的音乐、供奉与虔诚。',
      vn: 'Lễ hội thần linh (nat) nổi tiếng nhất — một tuần âm nhạc, lễ vật và sùng kính.',
      ne: 'सबैभन्दा प्रसिद्ध आत्मा (नत्) पर्व — सङ्गीत, चढावा र भक्तिको एक हप्ता।',
      id: 'Festival roh (nat) paling terkenal — sepekan musik, persembahan, dan pengabdian.',
    },
  },
  {
    name: 'Tawthalin', mm: 'တော်သလင်း', greg: 'Aug–Sep', region: 'Rivers', color: '#7dd3fc', file: 'thawthalin',
    festival: { en: 'Royal Regatta · Boat Races', mm: 'တော်သလင်း လှေပြိုင်ပွဲ', jp: 'タウタリン 舟レース', zh: '多塔林 赛船节', vn: 'Tawthalin — Đua thuyền', ne: 'तौथलिन डुङ्गा दौड', id: 'Tawthalin — Lomba Perahu' },
    desc: {
      en: 'Calm post-monsoon waters host the season of elegant royal boat races and regattas.',
      mm: 'မိုးလွန်ကာလ၏ ငြိမ်သက်သော ရေပြင်ပေါ်တွင် မင်းမြတ်လှေပြိုင်ပွဲများ ကျင်းပသည်။',
      jp: '雨季明けの穏やかな水面で、優雅な王室舟レースが行われます。',
      zh: '雨季过后水面平静，正是优雅皇家赛船的季节。',
      vn: 'Mặt nước êm ả sau mùa mưa mở ra mùa đua thuyền hoàng gia thanh lịch.',
      ne: 'मनसुनपछिको शान्त पानीमा भव्य राजकीय डुङ्गा दौडको मौसम सुरु हुन्छ।',
      id: 'Perairan tenang seusai musim hujan menjadi musim lomba perahu kerajaan yang anggun.',
    },
  },
  {
    name: 'Thadingyut', mm: 'သီတင်းကျွတ်', greg: 'Sep–Oct', region: 'Nationwide', color: '#fca5a5', file: 'thidinkyaut',
    festival: { en: 'Thadingyut Festival of Lights', mm: 'သီတင်းကျွတ် မီးထွန်းပွဲ', jp: 'タディンジュ 灯明祭', zh: '达丁聚 万灯节', vn: 'Thadingyut — Lễ hội Ánh sáng', ne: 'थादिङ्ग्युत दीप पर्व', id: 'Thadingyut — Festival Cahaya' },
    desc: {
      en: 'Homes, streets and pagodas glow with candles to welcome the Buddha’s return; Lent ends.',
      mm: 'ဘုရားရှင် ဆင်းသက်ကြွလာတော်မူခြင်းကို ကြိုဆိုရန် အိမ်၊ လမ်းနှင့် စေတီများ မီးအလင်းဖြင့် ဝါကျွတ်ပွဲ ဆင်နွှဲကြသည်။',
      jp: '仏陀の帰還を祝い、家・街・仏塔がろうそくの灯で輝きます。雨安居の終了。',
      zh: '家家户户、街道与佛塔点亮烛火，迎接佛陀归来；安居结束。',
      vn: 'Nhà cửa, phố phường và chùa rực sáng nến đón Phật trở về; mùa an cư kết thúc.',
      ne: 'बुद्धको आगमन स्वागत गर्न घर, सडक र स्तूपहरू मैनबत्तीले झलमल हुन्छन्; वर्षावास सकिन्छ।',
      id: 'Rumah, jalan, dan pagoda bercahaya lilin menyambut kembalinya Buddha; Vassa berakhir.',
    },
  },
  {
    name: 'Tazaungmon', mm: 'တန်ဆောင်မုန်း', greg: 'Oct–Nov', region: 'Taunggyi', color: '#d8b4fe', file: 'tansaungmone',
    festival: { en: 'Tazaungdaing Fire-Balloons', mm: 'တန်ဆောင်မုန်း မီးပုံးပျံပွဲ', jp: 'タザウンモン 熱気球祭', zh: '达桑蒙 热气球灯节', vn: 'Tazaungdaing — Khinh khí cầu lửa', ne: 'तजौङदाइङ अग्नि-गुब्बारा', id: 'Tazaungdaing — Balon Api' },
    desc: {
      en: 'Fire balloons rise into the night sky in a dazzling second festival of lights.',
      mm: 'ဒုတိယ မီးထွန်းပွဲတော်တွင် မီးပုံးပျံများ ည၏ကောင်းကင်သို့ တလူလူ တက်သွားကြသည်။',
      jp: '夜空に火の気球が舞い上がる、きらびやかな第二の灯明祭。',
      zh: '璀璨的第二个灯节，火热气球升上夜空。',
      vn: 'Khinh khí cầu lửa bay lên bầu trời đêm trong lễ hội ánh sáng thứ hai rực rỡ.',
      ne: 'दोस्रो दीप पर्वमा आगोका गुब्बाराहरू रातको आकाशमा उड्छन्।',
      id: 'Balon api membumbung ke langit malam dalam festival cahaya kedua yang memukau.',
    },
  },
  {
    name: 'Nadaw', mm: 'နတ်တော်', greg: 'Nov–Dec', region: 'Nationwide', color: '#c4b5fd', file: 'nattaw',
    festival: { en: 'Nadaw Nat & Literature', mm: 'နတ်တော် (နတ်ပွဲနှင့် စာပေ)', jp: 'ナドー ナッと文学の月', zh: '纳道 神灵与文学月', vn: 'Nadaw — Thần linh & Văn học', ne: 'नादौ — नत् र साहित्य', id: 'Nadaw — Roh & Sastra' },
    desc: {
      en: 'A month for honouring the nats (spirits) and celebrating Myanmar poetry and literature.',
      mm: 'နတ်များကို ပူဇော်ပသခြင်းနှင့် မြန်မာကဗျာ၊ စာပေတို့ကို ဂုဏ်ပြုသည့်လ။',
      jp: 'ナッ（精霊）を称え、ミャンマーの詩と文学を祝う月。',
      zh: '敬奉神灵（Nat）、礼赞缅甸诗歌与文学的月份。',
      vn: 'Tháng tôn vinh các nat (thần linh) và tôn vinh thơ ca, văn học Myanmar.',
      ne: 'नत् (आत्मा) हरूको सम्मान र म्यानमारको कविता तथा साहित्य मनाउने महिना।',
      id: 'Bulan menghormati nat (roh) serta merayakan puisi dan sastra Myanmar.',
    },
  },
  {
    name: 'Pyatho', mm: 'ပြာသို', greg: 'Dec–Jan', region: 'Bagan', color: '#93c5fd', file: 'pyatho',
    festival: { en: 'Ananda Pagoda Festival', mm: 'ပြာသို အာနန္ဒာ ဘုရားပွဲ', jp: 'ピャトー アーナンダ寺院祭', zh: '比亚多 阿南达佛塔节', vn: 'Lễ hội Chùa Ananda Pyatho', ne: 'प्यथो आनन्द मन्दिर पर्व', id: 'Festival Kuil Ananda Pyatho' },
    desc: {
      en: 'Pilgrims and bullock carts gather at Bagan’s Ananda Temple under the cool-season sky.',
      mm: 'ဆောင်းရာသီကောင်းကင်အောက်တွင် ဘုရားဖူးများနှင့် နွားလှည်းများ ပုဂံ အာနန္ဒာဘုရားသို့ စုဝေးလာကြသည်။',
      jp: '涼季の空の下、巡礼者と牛車がバガンのアーナンダ寺院に集います。',
      zh: '凉季天空下，朝圣者与牛车齐聚蒲甘阿南达寺。',
      vn: 'Khách hành hương và xe bò tụ hội tại chùa Ananda (Bagan) dưới bầu trời mùa mát.',
      ne: 'चिसो मौसमको आकाशमुनि तीर्थयात्री र गोरुगाडाहरू बागानको आनन्द मन्दिरमा भेला हुन्छन्।',
      id: 'Peziarah dan pedati sapi berkumpul di Kuil Ananda, Bagan, di bawah langit musim sejuk.',
    },
  },
  {
    name: 'Tabodwe', mm: 'တပို့တွဲ', greg: 'Jan–Feb', region: 'Nationwide', color: '#fbcfe8', file: 'tapohtwe',
    festival: { en: 'Htamane Glutinous-Rice Feast', mm: 'တပို့တွဲ ထမနဲပွဲ', jp: 'タボドゥエ タマネ祭', zh: '达波推 糯米饭节', vn: 'Tabodwe — Lễ hội Htamane', ne: 'तबोद्वे — हतामाने पर्व', id: 'Tabodwe — Festival Htamane' },
    desc: {
      en: 'Communities cook giant pans of htamane (sticky-rice) together in a harvest thanksgiving.',
      mm: 'ကောက်သစ်စားပွဲအဖြစ် ရပ်ရွာများ စုပေါင်း၍ ထမနဲ (ကောက်ညှင်းထမင်း) အကြီးစား ကျက်ပြုတ်ကြသည်။',
      jp: '収穫感謝として、地域が集い大鍋でタマネ（もち米）を炊きます。',
      zh: '丰收感恩之际，社区齐聚共煮大锅糯米饭（htamane）。',
      vn: 'Cộng đồng cùng nấu những chảo lớn htamane (xôi) trong lễ tạ ơn mùa màng.',
      ne: 'बाली भित्र्याएको आभार स्वरूप समुदायहरू मिलेर ठूला ताउलामा हतामाने (टाँसिने भात) पकाउँछन्।',
      id: 'Warga bersama memasak htamane (ketan) dalam wajan raksasa sebagai syukuran panen.',
    },
  },
  {
    name: 'Tabaung', mm: 'တပေါင်း', greg: 'Feb–Mar', region: 'Yangon', color: '#fcd34d', file: 'tabaung',
    festival: { en: 'Shwedagon Pagoda Festival', mm: 'တပေါင်း ရွှေတိဂုံ ဘုရားပွဲ', jp: 'タバウン シュエダゴン・パゴダ祭', zh: '达邦 大金塔节', vn: 'Lễ hội Chùa Shwedagon Tabaung', ne: 'तबाउङ श्वेडागोन पर्व', id: 'Festival Pagoda Shwedagon Tabaung' },
    desc: {
      en: 'The golden Shwedagon glows as the largest paya-pwè of the year unfolds; sand-pagoda festivals abound.',
      mm: 'တစ်နှစ်တာ၏ အကြီးဆုံး ဘုရားပွဲဖြစ်ပြီး ရွှေတိဂုံစေတီတော် ရွှေရောင်တောက်ပကာ သဲပုံစေတီပွဲများ ပေါများသည်။',
      jp: '年間最大のパヤー・プエとして黄金のシュエダゴンが輝き、各地で砂の仏塔祭りが行われます。',
      zh: '一年中最盛大的佛塔节，金色大金塔熠熠生辉，沙塔节庆遍布各地。',
      vn: 'Chùa Vàng Shwedagon rực sáng trong lễ hội chùa lớn nhất năm; khắp nơi có lễ hội tháp cát.',
      ne: 'वर्षकै ठूलो पया-प्वेका रूपमा सुनौलो श्वेडागोन झलमल हुन्छ; बालुवाका स्तूप पर्वहरू व्यापक हुन्छन्।',
      id: 'Shwedagon emas bersinar dalam paya-pwè terbesar tahun ini; festival pagoda pasir di mana-mana.',
    },
  },
]

// ─── Multilingual blog translations ───────────────────────────────────────────
const kyotoContent = {
  en: {
    excerpt: 'Where tradition meets modern beauty.',
    body: `Kyoto in winter carries a stillness that no other season can replicate. The red and white camellia blossoms push through frosted soil beside ancient stone lanterns, a quiet defiance against the cold.

I wandered through the back alleys of Gion, past wooden machiya townhouses and the faint smell of incense drifting from temple gates. The city whispered its thousand-year history in every cobblestone.

For a developer who spends most days staring at screens, these moments of analog beauty are deeply grounding. Kyoto reminds me why I code — not just to build systems, but to preserve and share experiences like these.`,
  },
  mm: {
    excerpt: 'ထုံးတမ်းစဉ်လာနှင့် ခေတ်မီလှပမှုတို့ တွေ့ဆုံရာနေရာ',
    body: `ကျိုတို၏ ဆောင်းရာသီသည် အခြားမည်သည့်ရာသီနှင့်မျှ မနှိုင်းယှဉ်နိုင်သော တိတ်ဆိတ်ငြိမ်းချမ်းမှုကို ဆောင်ကြဉ်းလာလေ့ရှိသည်။ ရေခဲမှတ်နီးပါး အေးစက်နေသော မြေပြင်မှနေ၍ နီရဲနေသည့် ကမေလီးယား (Camellia) ပန်းတို့သည် ရာစုနှစ်ပေါင်းများစွာ သက်တမ်းရှိသော ကျောက်မီးခုံများဘေးတွင် အေးမြသော မိုးကောင်းကင်ကို ဆန့်ကျင်ကာ ဂုဏ်ယူစွာ ပွင့်လန်းနေကြသည်။ဂီအိုန် (Gion) ၏ နောက်ကျောလမ်းသွယ်များတွင် လျှောက်လှမ်းရင်း သစ်သားမာချီယာ (Machiya) အိမ်များနှင့် ဘုရားကျောင်းတံခါးဝများမှ သင်းပျံ့လာသည့် ထင်းရှူးရနံ့ကို ရှူရှိုက်မိသည်။ ဤမြို့၏ ကျောက်ခင်းလမ်းတိုင်းသည် နှစ်ထောင်ချီကြာမြင့်ခဲ့သည့် သမိုင်းကြောင်းများကို တိတ်တဆိတ် စကားပြောနေသကဲ့သို့ပင်။
ကွန်ပျူတာမျက်နှာပြင်များရှေ့တွင် တစ်နေ့တာကို ကုန်ဆုံးလေ့ရှိသည့် ဆော့ဖ်ဝဲလ်ရေးသားသူ (Developer) တစ်ဦးအတွက်မူ ဤသို့သော သဘာဝ၏ အလှတရားများသည် ကျွန်ုပ်အား မြေပြင်ပေါ်သို့ ပြန်လည်ရောက်ရှိစေကာ စိတ်ကို ပေါ့ပါးလန်းဆန်းစေသည်။ ကျိုတိုမြို့သည် ကျွန်ုပ်ဘာကြောင့် ကုဒ် (Code) များ စတင်ရေးသားခဲ့ရသည်ဆိုသည့် မူလရည်ရွယ်ချက်ကို ပြန်လည်သတိရစေသည့် နေရာတစ်ခု ဖြစ်ပါတော့သည်။`,
  },
  jp: {
    excerpt: '伝統と現代の美しさが出会う場所',
    body: `冬の京都は、他のどの季節にも真似できない静寂を漂わせている。赤と白の椿が霜に覆われた土から顔を出し、古い石灯籠のそばで静かに寒さに抗っている。

祇園の路地裏を歩き、木造の町家を通り過ぎ、寺の山門から漂う線香の匂いを感じた。この街は石畳のひとつひとつに千年の歴史をささやいている。

毎日画面を見つめて過ごす開発者にとって、こんなアナログな美しさの瞬間は深く心を落ち着かせてくれる。京都は、なぜ自分がコードを書くのかを思い出させてくれる。システムを作るためだけでなく、こんな体験を残し、分かち合うために。`,
  },
  vn: {
    excerpt: 'Nơi truyền thống gặp gỡ vẻ đẹp hiện đại',
    body: `Kyoto mùa đông mang một vẻ tĩnh lặng mà không mùa nào khác có thể sánh được. Những bông hoa trà đỏ và trắng vươn lên từ mặt đất đóng băng bên cạnh những chiếc đèn đá cổ xưa, thầm lặng thách thức cái lạnh.

Tôi lang thang qua những con hẻm phía sau Gion, đi ngang những ngôi nhà machiya bằng gỗ và ngửi thấy thoảng mùi hương từ cổng chùa. Thành phố thì thầm lịch sử ngàn năm qua từng viên đá lát đường.

Với một lập trình viên dành phần lớn thời gian nhìn vào màn hình, những khoảnh khắc vẻ đẹp thuần túy như thế này mang lại sự bình yên sâu sắc. Kyoto nhắc tôi nhớ tại sao mình viết code.`,
  },
  ne: {
    excerpt: 'परम्परा र आधुनिक सौन्दर्य भेट्ने ठाउँ',
    body: `जाडोको क्योटोले अन्य कुनै मौसमले नक्कल गर्न नसक्ने स्थिरता बोकेको छ। रातो र सेतो क्यामेलिया फूलहरू जमेको माटोबाट पुराना ढुंगा बत्तीहरूको छेउमा निस्कन्छन्, चिसोलाई चुपचाप चुनौती दिँदै।

गियोनका पछाडिका गल्लीहरूमा घुमफिर गरें, काठका माचिया घरहरू पार गर्दै र मन्दिरका ढोकाबाट आउने धूपको हल्का सुगन्ध सुँघ्दै। यो शहरले हरेक ढुंगाको बाटोमा हजार वर्षको इतिहास फुसफुसायो।

स्क्रिन हेरेर बिताउने developer का लागि, यस्ता एनालग सौन्दर्यका क्षणहरूले गहिरो आधार दिन्छ। क्योटोले मलाई सम्झाउँछ — मैले code किन लेख्छु।`,
  },
  id: {
    excerpt: 'Di mana tradisi bertemu keindahan modern',
    body: `Kyoto di musim dingin membawa keheningan yang tidak bisa ditiru musim lain. Bunga kamellia merah dan putih menembus tanah beku di samping lentera batu kuno, perlawanan diam-diam terhadap dingin.

Saya berjalan menyusuri gang-gang belakang Gion, melewati rumah townhouse machiya dari kayu dan aroma dupa yang samar dari pintu gerbang kuil. Kota ini berbisik sejarah seribu tahun di setiap batu jalan.

Bagi developer yang menghabiskan sebagian besar harinya menatap layar, momen keindahan analog seperti ini sangat membumi. Kyoto mengingatkan saya mengapa saya membuat kode — bukan hanya untuk membangun sistem, tetapi untuk melestarikan dan berbagi pengalaman seperti ini.`,
  },
}

const osakaContent = {
  en: {
    excerpt: 'Neon lights and street food beneath plum blossoms.',
    body: `Osaka is alive in a way few cities are. The street food stalls of Dotonbori, the crowd energy, the neon reflecting off wet pavement at 2am — it's a city that refuses to sleep.

But away from the noise, the plum blossoms in Osaka Castle Park bloom quietly in early February. Soft pink and white, a contrast to the city's usual maximalism.

I sat on a park bench with takoyaki in one hand, laptop in the other, writing code while cherry trees swayed overhead. This, I think, is the beauty of building a life in Japan.`,
  },
  mm: {
    excerpt: 'နီယွန်မီးရောင်များနှင့် အိုဆာကာ၏ အရသာများ',
    body: `

အိုဆာကာမြို့သည် အခြားမည်သည့်မြို့နှင့်မျှ မတူသည့် ကိုယ်ပိုင်ဟန်ဖြင့် အသက်ဝင်နေတတ်သည်။ ဒိုတွန်ဘိုရီ (Dotonbori) လမ်းမကြီးတစ်လျှောက်ရှိ လမ်းဘေးအစားအသောက်ဆိုင်များမှ အနံ့အသက်များ၊ လူအုပ်ကြီး၏ တက်ကြွမှု၊ ညဉ့်နက်သန်းခေါင်အချိန် မိုးရွာချလိုက်သည့် ကတ္တရာလမ်းပေါ်၌ ရောင်ပြန်ဟပ်နေသော နီယွန်မီးရောင်များ — ဤသည်မှာ အိုဆာကာမြို့၏ ပုံရိပ်ဖြစ်ပြီး "ဘယ်သောအခါမှ အိပ်စက်ခြင်းမရှိသောမြို့" ဟုပင် ဆိုရပေမည်။
မြို့ပြ၏ ဆူညံသံများနှင့် ဝေးကွာသော အိုဆာကာရဲတိုက်ဥယျာဉ် (Osaka Castle Park) တွင်မူ အခြားသော အငွေ့အသက်ကို ခံစားရသည်။ ဖေဖော်ဝါရီလ အစောပိုင်းတွင် တိတ်တဆိတ် ပွင့်လန်းလာသော သင်္ဘောသဖန်းပန်း (Plum blossoms) များသည် အိုဆာကာမြို့၏ အမြဲမပြတ် ရုန်းကန်လှုပ်ရှားနေသည့် "Maximalism" ပုံစံနှင့် လုံးဝဆန့်ကျင်ဘက်ဖြစ်ပြီး၊ ၎င်းတို့၏ နူးညံ့သည့် ပန်းရောင်နှင့် ဖြူဖွေးသည့်အရောင်များသည် မြို့တော်၏ တိတ်ဆိတ်လှပသော ကဏ္ဍတစ်ခုကို ထုတ်ဖော်ပြသနေသည်။`,
  },
  jp: {
    excerpt: '梅の花の下でネオンライトと屋台グルメ',
    body: `大阪は、他のどの都市とも違う生き生きとした活気がある。道頓堀の屋台、人混みのエネルギー、夜中の2時に濡れた歩道に映えるネオン — この街は眠ることを拒む。

でも喧騒を離れると、大阪城公園の梅の花が2月初旬に静かに咲いている。淡いピンクと白は、この街の通常のマキシマリズムとは対照的だ。

たこ焼きを片手に、ラップトップをもう片方の手に持って、桜の木が揺れるのを見ながらコードを書いた。これが日本で生活を築くことの美しさだと思う。`,
  },
  vn: {
    excerpt: 'Đèn neon và ẩm thực đường phố dưới hoa mận',
    body: `Osaka sống động theo cách mà ít thành phố nào có được. Các quầy hàng ăn ở Dotonbori, năng lượng của đám đông, ánh đèn neon phản chiếu trên mặt đường ướt lúc 2 giờ sáng — đây là thành phố không chịu ngủ.

Nhưng xa khỏi tiếng ồn, những bông hoa mận trong Công viên Lâu đài Osaka nở nhẹ nhàng vào đầu tháng Hai. Màu hồng và trắng mềm mại, tương phản với chủ nghĩa tối đa thông thường của thành phố.

Tôi ngồi trên ghế công viên với takoyaki trên tay, máy tính xách tay trên tay kia, viết code trong khi cây anh đào đung đưa phía trên đầu.`,
  },
  ne: {
    excerpt: 'बेर फूलमुनि नियोन बत्ती र सडकको खाना',
    body: `ओसाका कम नगरहरूले जस्तो जीवन्त तरिकामा बाँच्छ। डोटोन्बोरीका खाना स्टलहरू, भीडको ऊर्जा, रातको दुई बजे भिजेको ढुंगामा प्रतिबिम्बित हुने नियोन बत्तीहरू — यो सुत्न नमान्ने सहर हो।

तर कोलाहलबाट टाढा, ओसाका क्यासल पार्कका बेरका फूलहरू फेब्रुअरी सुरुमा चुपचाप फुल्छन्। कोमल गुलाबी र सेतो, सहरको सामान्य अतिवादसँग विपरीत।

एउटा हातमा ताकोयाकी, अर्कोमा ल्यापटप लिएर, चेरी रूखहरू माथि हल्लिँदा कोड लेखें।`,
  },
  id: {
    excerpt: 'Lampu neon dan makanan jalanan di bawah bunga plum',
    body: `Osaka hidup dengan cara yang hanya sedikit kota bisa menandinginya. Warung makanan di Dotonbori, energi keramaian, neon yang memantul di trotoar basah pukul 2 pagi — ini adalah kota yang menolak untuk tidur.

Tapi jauh dari kebisingan, bunga plum di Taman Kastil Osaka mekar dengan tenang di awal Februari. Merah muda lembut dan putih, kontras dengan maksimalisme kota yang biasa.

Saya duduk di bangku taman dengan takoyaki di satu tangan, laptop di tangan lain, menulis kode sementara pohon ceri berayun di atasnya. Ini, menurut saya, adalah keindahan membangun kehidupan di Jepang.`,
  },
}


const tokyoContent = {
  en: {
    excerpt: 'Neon dreams and the pulse of technology.',
    body: `Tokyo is the city where the future happens. From the intricate web of trains to the towering digital displays of Shibuya, it is a place where relentless ambition meets unparalleled efficiency. It is the global epicenter of technology and innovation.

Yet, amidst the glass skyscrapers and neon-lit nights, hidden shrines remain. It is a city that breathes success while never forgetting the discipline of its past. 

For a developer, Tokyo is more than a city; it is a canvas of possibilities. Every line of code I write here feels like a step toward a future that is already being built on these streets.`,
  },
  mm: {
    excerpt: 'နီယွန်အိပ်မက်များနှင့် နည်းပညာ၏ အသက်ရှူသံ။',
    body: `တိုကျိုသည် အနာဂတ်ကို လက်တွေ့ဖော်ဆောင်နေသည့် မြို့တော်ဖြစ်သည်။ ရှုပ်ထွေးလှသော မီးရထားလမ်းကြောင်းများမှသည် ရှီဘူယာ၏ မျက်စိကျစရာ ဒစ်ဂျစ်တယ်မျက်နှာပြင်များအထိ၊ ဤမြို့သည် ပြင်းပြသောဆန္ဒများနှင့် ထူးခြားသောစွမ်းဆောင်ရည်များ ပေါင်းစပ်ရာနေရာဖြစ်သည်။ ၎င်းသည် ကမ္ဘာ့နည်းပညာနှင့် ဆန်းသစ်တီထွင်မှုတို့၏ ဗဟိုချက်မဖြစ်သည်။

သို့သော်လည်း မှန်စီရံထားသည့် အဆောက်အအုံကြီးများနှင့် နီယွန်မီးရောင်များကြားတွင် ရှေးဟောင်းဘုရားကျောင်းလေးများမှာမူ ငြိမ်းချမ်းစွာ တည်ရှိနေဆဲဖြစ်သည်။ ဤမြို့သည် အောင်မြင်မှုကို အသက်ရှူသံတိုင်းတွင် ထည့်သွင်းထားသလို၊ သူ၏ အတိတ်က စည်းကမ်းတကျရှိမှုကိုလည်း ဘယ်သောအခါမျှ မေ့လျော့ခြင်းမရှိပေ။

Developer တစ်ယောက်အတွက် တိုကျိုသည် မြို့တစ်မြို့ထက် ပိုပါသည်။ ၎င်းသည် အခွင့်အရေးများစွာရှိသည့် ပန်းချီကားတစ်ချပ်ဖြစ်သည်။ ဤလမ်းမများပေါ်တွင် ကျွန်ုပ်ရေးသားလိုက်သည့် ကုဒ်တိုင်းသည် အနာဂတ်ဆီသို့ ခြေလှမ်းတစ်လှမ်းချင်း တိုးဝင်နေသကဲ့သို့ ခံစားရသည်။`,
  },

  jp: {
    excerpt: 'ネオンの夢とテクノロジーの鼓動',
    body: `東京は未来が現実となる街だ。複雑な鉄道網から渋谷の巨大なデジタルサイネージまで、ここは絶え間ない野心と比類なき効率性が交差する場所だ。東京はテクノロジーとイノベーションの世界的な中心地である。

しかし、ガラスの摩天楼とネオンの夜の合間には、静かな神社が息づいている。この街は成功の鼓動を感じさせながらも、過去の規律を決して忘れない。

エンジニアにとって、東京は単なる街以上の存在だ。可能性というキャンバスであり、ここで書くすべてのコードが、この街で形作られる未来への一歩のように感じられる。`,
  },
  vn: {
    excerpt: 'Giấc mơ neon và nhịp đập của công nghệ.',
    body: `Tokyo là thành phố nơi tương lai trở thành hiện thực. Từ mạng lưới tàu hỏa phức tạp đến các màn hình kỹ thuật số rực rỡ ở Shibuya, đây là nơi mà tham vọng không ngừng nghỉ gặp gỡ hiệu suất vô song. Đây là trung tâm toàn cầu của công nghệ và đổi mới.

Tuy nhiên, giữa những tòa nhà chọc trời bằng kính và đêm neon, những ngôi đền ẩn giấu vẫn tồn tại. Đó là một thành phố hít thở sự thành công nhưng không bao giờ quên đi kỷ luật của quá khứ.

Đối với một lập trình viên, Tokyo không chỉ là một thành phố; nó là một bức tranh của những khả năng. Mỗi dòng code tôi viết ở đây giống như một bước tiến tới tương lai đang được xây dựng trên chính những con phố này.`,
  },
  ne: {
    excerpt: 'नियोन सपनाहरू र प्रविधिको स्पन्दन।',
    body: `टोक्यो त्यो सहर हो जहाँ भविष्य वास्तविकता बन्छ। जटिल रेल सञ्जालदेखि सिबुयाका चम्किलो डिजिटल डिस्प्लेहरूसम्म, यो स्थान अथक महत्वाकांक्षा र अनुपम दक्षताको संगम हो। यो प्रविधि र नवाचारको विश्वव्यापी केन्द्र हो।

तर, सिसाका गगनचुम्बी भवनहरू र नियोन-प्रकाशित रातहरूका बीचमा, लुकेका मन्दिरहरू शान्त छन्। यो यस्तो सहर हो जसले सफलताको सास फेर्छ तर आफ्नो विगतको अनुशासनलाई कहिल्यै बिर्सदैन।

एक डेभलपरका लागि, टोक्यो सहर मात्र होइन; यो सम्भावनाहरूको क्यानभास हो। यहाँ मैले लेखेको प्रत्येक कोड यस सहरका सडकहरूमा निर्माण भइरहेको भविष्यतर्फको पाइला जस्तो लाग्छ।`,
  },
  id: {
    excerpt: 'Mimpi neon dan denyut nadi teknologi.',
    body: `Tokyo adalah kota tempat masa depan menjadi kenyataan. Dari jaringan kereta yang rumit hingga tampilan digital yang megah di Shibuya, ini adalah tempat di mana ambisi yang tak henti-hentinya bertemu dengan efisiensi yang tak tertandingi. Ini adalah pusat global teknologi dan inovasi.

Namun, di tengah gedung pencakar langit kaca dan malam yang diterangi neon, kuil-kuil tersembunyi tetap ada. Ini adalah kota yang menghirup kesuksesan tanpa pernah melupakan disiplin masa lalunya.

Bagi seorang pengembang, Tokyo lebih dari sekadar kota; ini adalah kanvas kemungkinan. Setiap baris kode yang saya tulis di sini terasa seperti langkah menuju masa depan yang sedang dibangun di jalanan ini.`,
  },
}




const thoughtsContent = {
  en: {
    excerpt: '"Sometimes, you just need to disconnect to reconnect."',
    body: `There's a forest trail I found outside of the city. No cell reception. No notifications. Just the sound of wind in cedar trees and the occasional crow.

I go there when the codebase feels tangled, or when a problem I've been chasing refuses to yield. Invariably, the solution arrives on the walk back.

Disconnecting is not failure. It's maintenance. The same discipline that keeps servers healthy applies to humans too.`,
  },
  mm: {
    excerpt: '"တစ်ခါတစ်ရံ ပြန်လည်ချိတ်ဆက်ရန် ချိတ်ဆက်မှုဖြတ်ရသည်"',
    body: `မြို့ပြင်ရှိ တောနက်ထဲတွင် ကျွန်ုပ်သာသိသော လမ်းကြောင်းလေးတစ်ခုရှိသည်။ ထိုနေရာတွင် ဖုန်းလိုင်းများ မရှိသလို၊ အသိပေးချက် (Notification) များ၏ အနှောင့်အယှက်လည်း ကင်းစင်သည်။ ထင်းရှူးရွက်များကြားမှ လေတိုးသံနှင့် ရံဖန်ရံခါ ကြားရတတ်သည့် ကျီးကန်းသံများကသာ တိတ်ဆိတ်မှုကို ဖြည့်ဆည်းပေးထားသည်။
ကုဒ် (Code) များ ရှုပ်ထွေးလွန်း၍ စိတ်အာရုံများ လည်ပင်းခေတ်ဖြစ်နေချိန် သို့မဟုတ် ပြဿနာတစ်ခုကို မည်သို့မျှ အဖြေရှာမရတော့သည့်အခါ ထိုနေရာသို့ ကျွန်ုပ်သွားလေ့ရှိသည်။ ထူးခြားသည်မှာ ပြန်လမ်းတွင် အမြဲဆိုသလိုပင် လိုချင်သည့်အဖြေများက စိတ်ထဲသို့ ပေါ်ပေါက်လာတတ်သည်။
အမှန်စင်စစ်... လောကကြီးနှင့် အဆက်ဖြတ်ခြင်းဆိုသည်မှာ ရှုံးနိမ့်ခြင်းမဟုတ်ပါ။ မိမိကိုယ်ကို ပြန်လည်ပြုပြင်ထိန်းသိမ်းခြင်း (System Maintenance) သာ ဖြစ်သည်။`,
  },
  jp: {
    excerpt: '「時には、繋がり直すために切り離す必要がある」',
    body: `街の外に森のトレイルを見つけた。携帯の電波なし。通知なし。杉の木を吹き抜ける風の音と、時折聞こえるカラスの声だけ。

コードベースが絡み合っていると感じるとき、または追いかけていた問題が解決しないとき、そこへ行く。帰り道には、決まって解決策が浮かんでくる。

切り離すことは失敗ではない。それはメンテナンスだ。サーバーを健全に保つ規律は、人間にも同様に適用される。`,
  },
  vn: {
    excerpt: '"Đôi khi, bạn cần ngắt kết nối để kết nối lại"',
    body: `Có một con đường mòn trong rừng tôi tìm thấy ngoài thành phố. Không có sóng điện thoại. Không có thông báo. Chỉ có tiếng gió trong cây tuyết tùng và tiếng quạ thỉnh thoảng.

Tôi đến đó khi codebase cảm thấy rối rắm, hoặc khi một vấn đề tôi đang theo đuổi không chịu nhượng bộ. Thường thì giải pháp xuất hiện trên đường về.

Ngắt kết nối không phải là thất bại. Đó là bảo trì.`,
  },
  ne: {
    excerpt: '"कहिलेकाहीं, पुन: जडान गर्न विडान गर्नु पर्छ"',
    body: `सहर बाहिर एउटा वन पगडण्डी फेला पारेको छु। मोबाइल सिग्नल छैन। सूचनाहरू छैनन्। देवदारका रुखहरूमा हावाको आवाज र कहिलेकाहीं काग मात्र सुनिन्छ।

कोडबेस उल्झिएको लागे वा पछ्याइरहेको समस्याले नदिएजस्तो लागे, त्यहाँ जान्छु। फर्कने बाटोमा समाधान आइपुग्छ।

विडान गर्नु असफलता होइन। यो मर्मत हो।`,
  },
  id: {
    excerpt: '"Terkadang, kamu perlu memutus sambungan untuk terhubung kembali"',
    body: `Ada jalur hutan yang saya temukan di luar kota. Tidak ada sinyal ponsel. Tidak ada notifikasi. Hanya suara angin di pohon cedar dan sesekali gagak.

Saya pergi ke sana ketika codebase terasa kusut, atau ketika masalah yang saya kejar tidak mau menyerah. Solusi selalu datang dalam perjalanan pulang.

Memutus sambungan bukan kegagalan. Itu adalah pemeliharaan. Disiplin yang sama yang menjaga server tetap sehat berlaku untuk manusia juga.`,
  },
}

const kaigoContent = {
  en: {
    excerpt: '"Life is not ever easy — keep patient and resilient."',
    body: `Before I wrote my first line of code professionally, I spent years as a care worker — Kaigo — in Japan. Early mornings, late nights, the weight of responsibility for another person's dignity.

It taught me patience in a way no programming book can. It taught me to read between the lines — to understand what someone needs even when they can't articulate it. These are skills that make a better engineer, not just a better human.

I don't regret the path. I carry it into every project, every team interaction, every line of code I write. Empathy is a feature, not a bug.`,
  },
  mm: {
    excerpt: '"ဘဝသည် လွယ်ကူလေ့မရှိ — သည်းခံခြင်းနှင့် ခံနိုင်ရည်ရှိခြင်းသည်ပင် အောင်မြင်မှု၏ အခြေခံပင်"',
    body: `ကျွန်ုပ် ပရော်ဖက်ရှင်နယ် ဆော့ဖ်ဝဲလ်ရေးသားသူ (Developer) အဖြစ် မစတင်မီက ဂျပန်နိုင်ငံတွင် "ကိုင်ဂို" (Kaigo) ခေါ် လူနာပြုစုစောင့်ရှောက်ရေးလုပ်ငန်းဖြင့် နှစ်ပေါင်းများစွာ ဖြတ်သန်းခဲ့ရသည်။ နံနက်ခင်းတိုင်း၊ ညဉ့်နက်ချိန်တိုင်းတွင် တစ်ဦးတစ်ယောက်၏ ဂုဏ်သိက္ခာကို ထိန်းသိမ်းရင်း၊ တာဝန်ဝတ္တရားများကို မညည်းမညူ ဆောင်ရွက်ခဲ့ရသည့် အချိန်များသည် ကျွန်ုပ်အတွက် အဖိုးမဖြတ်နိုင်သော သင်ခန်းစာများ ဖြစ်ခဲ့သည်။
ထိုကာလများသည် Programming စာအုပ်များ မပေးနိုင်သော သည်းခံခြင်းတရားကို ကျွန်ုပ်အား လက်တွေ့သင်ကြားပေးခဲ့သည်။ လူနာများ စကားမပြောနိုင်သည့်အချိန်တွင်ပင် ၎င်းတို့၏ လိုအပ်ချက်ကို နားလည်ပေးနိုင်ရန်အတွက် "မပြောပြသည့် စကားကြားမှ အဓိပ္ပာယ်ကို ဖတ်တတ်အောင်" (Reading between the lines) လေ့ကျင့်ပေးခဲ့သည်။
ထိုလမ်းကြောင်းကို ဖြတ်သန်းခဲ့ရသည့်အတွက် ကျွန်ုပ်တစ်စုံတစ်ရာ နောင်တမရပါ။ ထိုအတွေ့အကြုံများသည် ကျွန်ုပ်၏ လက်ရှိလုပ်ငန်းခွင် ပရောဂျက်တစ်ခုစီ၊ အဖွဲ့အစည်းအတွင်း ပူးပေါင်းဆောင်ရွက်မှုတိုင်းနှင့် ကျွန်ုပ်ရေးသားလိုက်သည့် ကုဒ် (Code) တိုင်းတွင် အသက်ဝင်နေဆဲ ဖြစ်သည်။`,
  },

  jp: {
    excerpt: '"人生は決して簡単ではない — 忍耐と回復力を持とう"',
    body: `プロとして最初のコードを書く前、私は日本で介護士として何年も過ごした。早朝、深夜、他人の尊厳に対する責任の重さ。

どんなプログラミングの本も教えてくれない形で、忍耐を教わった。相手が言葉にできないときでも何が必要かを理解する — 行間を読む力を学んだ。それはより良いエンジニアを作るスキルであり、より良い人間を作るスキルでもある。

その道を後悔していない。それをすべてのプロジェクト、すべてのチームとのやり取り、すべてのコードの行に持ち込んでいる。共感はバグではなく、機能だ。`,
  },
  vn: {
    excerpt: '"Cuộc sống không bao giờ dễ dàng — hãy kiên nhẫn và kiên cường"',
    body: `Trước khi viết dòng code chuyên nghiệp đầu tiên, tôi đã dành nhiều năm làm nhân viên chăm sóc — Kaigo — tại Nhật Bản. Sáng sớm, đêm khuya, sức nặng của trách nhiệm với phẩm giá của người khác.

Nó dạy tôi sự kiên nhẫn theo cách không sách lập trình nào có thể làm. Nó dạy tôi đọc giữa các dòng — hiểu những gì ai đó cần ngay cả khi họ không thể diễn đạt.

Tôi không hối tiếc về con đường đó. Tôi mang nó vào mọi dự án, mọi tương tác nhóm, mọi dòng code tôi viết.`,

  },
  ne: {
    excerpt: '"जीवन कहिल्यै सजिलो छैन — धैर्य र लचिलोपन राख"',
    body: `पेशेवर रूपमा पहिलो कोड लेख्नु अघि, मैले जापानमा Kaigo — हेरचाह कार्यकर्ताको रूपमा वर्षौं बिताएँ। बिहानको झिसमिसे, राति ढिलो, अर्को व्यक्तिको मर्यादाको जिम्मेवारीको बोझ।

यसले मलाई कुनै प्रोग्रामिङ पुस्तकले सिकाउन नसक्ने तरिकामा धैर्य सिकायो। कसैले बोल्न नसक्दा पनि के चाहिन्छ भनेर बुझ्न — लाइनबीचको कुरा पढ्न सिकायो।

त्यो बाटोलाई पछुताउँदिन। यसलाई हरेक परियोजना, हरेक टोली अन्तरक्रिया, हरेक कोड लाइनमा बोकेर जान्छु।`,
  },
  id: {
    excerpt: '"Hidup tidak pernah mudah — tetap sabar dan tangguh"',
    body: `Sebelum menulis baris kode profesional pertama saya, saya menghabiskan bertahun-tahun sebagai pekerja perawatan — Kaigo — di Jepang. Pagi-pagi buta, malam larut, beban tanggung jawab atas martabat orang lain.

Itu mengajarkan saya kesabaran dengan cara yang tidak bisa dilakukan buku pemrograman manapun. Mengajarkan membaca antara baris — memahami apa yang seseorang butuhkan bahkan ketika mereka tidak bisa mengungkapkannya.

Saya tidak menyesal dengan jalan itu. Saya membawanya ke setiap proyek, setiap interaksi tim, setiap baris kode yang saya tulis. Empati adalah fitur, bukan bug.`,
  },
}

export const BLOG_POSTS = [
  {
    id: 'kyoto', size: 'large',
    date: 'Jan 15, 2026', tag: 'Travel',
    img: ASSETS.blog.kyoto,
    title: {
      en: 'Kyoto: Winter Camellias', mm: 'ကျိုတို၏ ဆောင်းရာသီ - ကမေလီးယားပန်းများ', jp: '京都：冬の椿', vn: 'Kyoto: Hoa Trà Mùa Đông', ne: 'क्योटो: जाडोको क्यामेलिया', id: 'Kyoto: Kamellia Musim Dingin'
    },
    translations: kyotoContent,
  },
  {
    id: 'osaka', size: 'medium',
    date: 'Feb 02, 2026', tag: 'Travel',
    img: ASSETS.blog.osaka,
    title: { en: 'Osaka: Plum Blossoms', mm: 'အိုဆာကာ၏ ဆောင်းဦး - သင်္ဘောသဖန်းပန်းများ', jp: '大阪：梅の花', vn: 'Osaka: Hoa Mận', ne: 'ओसाका: बेरका फूल', id: 'Osaka: Bunga Plum' },
    translations: osakaContent,
  },
  {
    id: 'tokyo', size: 'medium',
    date: 'May 18, 2026', tag: 'Travel',
    img: ASSETS.blog.tokyo,
    title: { en: 'Tokyo: Neon Futures', mm: 'တိုကျို - နီယွန်အနာဂတ်များ', jp: '東京：ネオンの未来', vn: 'Tokyo: Tương Lai Neon', ne: 'टोकियो: नियोन भविष्य', id: 'Tokyo: Masa Depan Neon' },
    translations: tokyoContent,
  },
  {
    id: 'thoughts', size: 'medium',
    date: 'Mar 10, 2026', tag: 'Musings',
    img: ASSETS.blog.thoughts,
    title: { en: 'Solitude in Nature', mm: 'သဘာဝတရား၏ တိတ်ဆိတ်ငြိမ်းချမ်းမှု (သို့မဟုတ်) သဘာဝအလယ်က တစ်ကိုယ်တော်ငြိမ်းချမ်းခြင်း', jp: '自然の中の孤独', vn: 'Cô Đơn Trong Thiên Nhiên', ne: 'प्रकृतिमा एकान्त', id: 'Kesendirian di Alam' },
    translations: thoughtsContent,
  },
  {
    id: 'kaigo_experience', size: 'wide',
    date: 'Apr 10, 2026', tag: 'Care Giving',
    img: ASSETS.blog.kaigo_experience,
    title: { en: 'Life of a Care Giver (Kaigo)', mm: 'ခဣဂေါ့(ပြုစုစောင့်ရှောက်သူ) ဘဝအတွေ့အကြုံ', jp: '介護士の生活', vn: 'Cuộc Sống Người Chăm Sóc', ne: 'हेरचाहकर्ताको जीवन', id: 'Kehidupan Seorang Perawat' },
    translations: kaigoContent,
  },
]

export const INTERESTS = [
  { title: 'Cosmology', desc: 'Unraveling the mysteries of the universe and celestial mechanics.', icon: 'fas fa-globe-asia', color: '#a855f7', page: 'cosmology.html' },
  { title: 'Quantum Theory', desc: 'Exploring the fundamental nature of reality and particles.', icon: 'fas fa-atom', color: '#22d3ee', page: 'quantum-theory.html' },
  { title: 'Linguistics', desc: 'Mastering Japanese (N3+) & English communication arts.', icon: 'fas fa-language', color: '#fb4158', page: 'linguistics.html' },
  { title: 'FE / IT Study', desc: 'Fundamental Engineering, Algorithms & System Architecture.', icon: 'fas fa-laptop-code', color: '#facc15', page: 'fe-it-study.html' },
  { title: 'Occultism', desc: 'Ancient wisdom, symbolism, and the hidden arts.', icon: 'fas fa-eye', color: '#e84ad5', page: 'occultism.html' },
  { title: 'Fortune Prediction', desc: 'Astrology, Tarot, and analyzing destiny\'s path.', icon: 'fas fa-star', color: '#f472e3', page: 'fortune-prediction.html' },
  { title: 'General Knowledge', desc: 'History, Philosophy, and Random Curiosities.', icon: 'fas fa-lightbulb', color: '#38bdf8', page: 'general-knowledge.html' },
  { title: 'Unconditional Joke', desc: 'Humor, Satire, and Light-hearted moments.', icon: 'fas fa-theater-masks', color: '#34d399', page: 'unconditional-jokes.html' },
]
