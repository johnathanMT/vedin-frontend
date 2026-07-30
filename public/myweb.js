// ===========================================
// 1. Mobile Menu & Navigation Logic
// ===========================================
function toggleMenu() {
    const navLinks = document.getElementById("navLinks");
    navLinks.classList.toggle("active");
}

// Close menu when clicking a link
document.querySelectorAll('.nav-links li a').forEach(item => {
    item.addEventListener('click', () => {
        document.getElementById("navLinks").classList.remove("active");
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// ===========================================
// 2. Language Data (6 Languages)
// ===========================================
const translations = {
    // --- English (Original) ---
    en: {
        // Navigation Section 
        nav_home: "Home",
        nav_about: "About",
        nav_projects: "Projects",
        nav_blog: "Blog",
        nav_exploring: "Exploring",

        hero_hello: "Hello, I'm",
        hero_desc: "I Can Care and also Can Code 🇯🇵",
        hero_sub: "Care-giver | Computer Science Student | An Aspiring AI Engineer & Passionate Software Developer",
        btn_view: "View My Work",

        // About Me / Profile
        about_title: "Who Am I?",
        about_bio_short: "Living in Japan.Healthcare to Tech. I build software to solve real-world problems.",
        about_slogan: "Better Late Than Never",
        about_text_1: "Living in Japan.Powered by caffeine and an endless curiosity to learn",
        about_text_2: "Better Late Than Never",
        about_text_3: "My goal is to become an AI Engineer. I am exploring various fields as a 'A Dangerously Capable Generalist'.",

        // Projects General
        project_title: "My Projects",
        proj_1_title: "Python Automation",
        proj_1_desc: "Tools created to help with daily tasks.",
        proj_2_title: "Personal Studying",
        proj_2_desc: "Collection of university assignments and web designs.",
        proj_3_title: "Personal Portfolio",
        proj_3_desc: "This website, built with HTML, CSS, and JS.",

        nav_switch: "Switch Project:",

        // Python Page Specific
        py_hero_title: "Python Automation Lab 🐍",
        py_hero_desc: "Scripting solutions to automate boring daily tasks.",
        py_stack_title: "Tech Stack & Libraries",
        py_proj_title: "Featured Scripts",
        py_p1_title: "Excel Report Auto-Filler",
        py_p1_desc: "Automatically fills monthly care reports using data from raw CSV files.",
        py_p2_title: "Shift Schedule Formatter",
        py_p2_desc: "Converts messy shift emails into a clean Google Calendar format.",
        py_p3_title: "Daily News Scraper",
        py_p3_desc: "Scrapes Japan IT news and sends a summary to Line/Telegram.",

        // Education Page Specific
        edu_hero_title: "Knowledge is Power 📚",
        edu_hero_desc: "Tracking my path through NCC Diploma, AI Certifications, and Self-Study.",
        edu_current_title: "Current Curriculum",
        edu_assignments_title: "Assignment Showcase",
        edu_c1_title: "NCC L4 Diploma in Computing",
        edu_c2_title: "IBM AI Developer Professional",
        edu_c3_title: "Full Stack Development",

        // Portfolio Page
        port_hero_title: "Connecting the Dots 🌐",
        port_hero_desc: "From International Relations to Tech. My story of adaptation and growth.",
        port_work_title: "Professional Experience",
        port_edu_title: "Educational Background",

        // Job 1 (Caregiver)
        job_1_role: "Full-time Caregiver Staff",
        job_1_desc: "Currently working at Hirashima Hospital. Developed strong empathy, patience, and cross-cultural communication skills in a Japanese medical environment.",

        // Job 2 (Part-time)
        job_2_role: "Hospitality & Operations Associate",
        job_2_desc: "Balanced work and studies in Japan. Gained experience as a Kitchen Chef/Food Prep at Tendon Tenya (8 months) and Housekeeping at Hotel Monterey La Soeur Osaka (8 months).",

        // Job 3 (MPT/KDDI)
        job_3_role: "Telecom Operations Specialist",
        job_3_desc: "Played a key role at MPT/KDDI Joint Operations. Served 1 year as a Customer Agent Operator and 1 year in the SIM Data Validation Team, handling large-scale user data accuracy.",

        // Education
        edu_1_degree: "Bachelor of Arts (International Relations)",
        edu_1_school: "Dagon University, Myanmar",
        edu_2_degree: "Japanese Language Diploma",
        edu_2_school: "Well Japanese Language School",

        // Blog
        blog_section_title: "Travel Diary",
        kyoto_title: "Kyoto: Where Tradition Meets Beauty",
        location: "Kyoto, Japan",
        kyoto_intro: "Kyoto is the cultural capital of Japan. From the Golden Pavilion to the Bamboo Forest, every corner tells a history.",
        photo_1: "Gion District",
        photo_2: "Golden Pavilion",
        photo_3: "Bamboo Forest",
        photo_4: "Sakura Season",
        kyoto_outro: "Traveling is tiring but refreshing. I hope to visit again in winter.",
        footer_contact: "Contact Me"
    },

    // --- Myanmar ---
    mm: {
        nav_home: "ပင်မစာမျက်နှာ",
        nav_about: "အကြောင်း",
        nav_projects: "လက်ရာများ",
        nav_blog: "မှတ်တမ်း",
        nav_exploring: "စူးစမ်းလေ့လာ",

        hero_hello: "မင်္ဂလာပါ၊ ကျွန်တော်ကတော့",
        hero_desc: "ပြုစုစောင့်ရှောက်ခြင်းမှ ဆန်းသစ်တီထွင်ဆန်တီးခြင်းသို့",
        hero_sub: "ကျန်းမာရေးစောင့်ရှောက်သူ | ကွန်ပျူတာသိပ္ပံ ကျောင်းသား | အနာဂတ် AI အင်ဂျင်နီယာနှင့် စိတ်အားထက်သန်သော ဆော့ဖ်ဝဲလ်ရေးသားသူ",
        btn_view: "လက်ရာများကိုကြည့်ရန်",

        about_title: "ကျွန်တော့်အကြောင်း",
        about_bio_short: "ဂျပန်နိုင်ငံတွင် နေထိုင်ပါသည်။ ကျန်းမာရေးဝန်ထမ်းဘဝမှ နည်းပညာလောကသို့ ကူးပြောင်းကာ လက်တွေ့ဘဝ ပြဿနာများကို ဖြေရှင်းပေးမည့် Software များ ဖန်တီးနေသူပါ။",
        about_slogan: "နောက်ကျတာက လုံးဝမလုပ်တာထက် ပိုကောင်းပါတယ်",
        about_text_1: "ဂျပန်နိုင်ငံတွင် နေထိုင်ပါသည်။",
        about_text_2: "နောက်ကျတာက လုံးဝမလုပ်တာထက် ပိုကောင်းပါတယ်",
        about_text_3: "ကျွန်တော့်ရဲ့ ရည်မှန်းချက်ကတော့ AI အင်ဂျင်နီယာတစ်ယောက် ဖြစ်လာဖို့ပါ။ 'စွမ်းဆောင်ရည်မြင့်မားပြီး နယ်ပယ်စုံကျွမ်းကျင်သူ (A Dangerously Capable Generalist)' တစ်ယောက်အနေနဲ့ နယ်ပယ်အသီးသီးကို လေ့လာစူးစမ်းနေပါတယ်။",

        project_title: "ဖန်တီးမှုများ",
        proj_1_title: "Python Automation",
        proj_1_desc: "လုပ်ငန်းခွင် အထောက်အကူပြု Tool များ။",
        proj_2_title: "Personal Studying",
        proj_2_desc: "တက္ကသိုလ် Assignment များနှင့် Web Design များ။",
        proj_3_title: "Personal Portfolio",
        proj_3_desc: "HTML, CSS, JS ဖြင့်ရေးသားထားသော ဤဝက်ဘ်ဆိုက်။",

        nav_switch: "အခြားလက်ရာများ:",

        py_hero_title: "Python အလိုအလျောက်စနစ် 🐍",
        py_hero_desc: "နေ့စဉ် ငြီးငွေ့ဖွယ် အလုပ်များကို ကုဒ်ရေးပြီး ဖြေရှင်းခြင်း။",
        py_stack_title: "အသုံးပြုထားသော နည်းပညာများ",
        py_proj_title: "လက်ရာမွန်များ",
        py_p1_title: "Excel Report အော်တိုဖြည့်စနစ်",
        py_p1_desc: "လစဉ် Kaigo မှတ်တမ်းများကို CSV မှတဆင့် အလိုအလျောက် ဖြည့်သွင်းပေးသည်။",
        py_p2_title: "အဆိုင်းဇယား စီမံခန့်ခွဲမှု",
        py_p2_desc: "ရှုပ်ထွေးနေသော အဆိုင်းဇယားများကို Google Calendar ပုံစံသို့ ပြောင်းပေးသည်။",
        py_p3_title: "သတင်းကောက်ယူသူ (Scraper)",
        py_p3_desc: "ဂျပန် IT သတင်းများကို ရှာဖွေပြီး Line/Telegram သို့ ပို့ပေးသည်။",

        edu_hero_title: "ပညာသည်သာ တန်ခိုးစွမ်းအား 📚",
        edu_hero_desc: "NCC ဒီပလိုမာ၊ AI လက်မှတ်များနှင့် ကိုယ်တိုင်လေ့လာမှု မှတ်တမ်းများ။",
        edu_current_title: "လက်ရှိ လေ့လာနေသော ဘာသာရပ်များ",
        edu_assignments_title: "Assignment ပြခန်း",
        edu_c1_title: "NCC L4 ကွန်ပျူတာ ဒီပလိုမာ",
        edu_c2_title: "IBM AI Developer Professional",
        edu_c3_title: "Full Stack ဝက်ဘ်ပိုင်းဆိုင်ရာ",

        port_hero_title: "ဘဝမှတ်တိုင်များ 🌐",
        port_hero_desc: "နိုင်ငံတကာဆက်ဆံရေး မှသည် နည်းပညာလောကဆီသို့။",
        port_work_title: "လုပ်ငန်းခွင် အတွေ့အကြုံများ",
        port_edu_title: "ပညာရေး နောက်ခံ",

        job_1_role: "Caregiver (Full-time)",
        job_1_desc: "လက်ရှိတွင် Hirashima ဆေးရုံ၌ တာဝန်ထမ်းဆောင်နေပါသည်။ ဂျပန်လုပ်ငန်းခွင် ယဉ်ကျေးမှုနှင့် လူနာပြုစုစောင့်ရှောက်မှုတွင် ကျွမ်းကျင်စွာ လုပ်ကိုင်နေပါသည်။",

        job_2_role: "ဝန်ဆောင်မှုနှင့် စီမံခန့်ခွဲမှု (အချိန်ပိုင်း)",
        job_2_desc: "ဂျပန်စာသင်ကြားနေစဉ် Tendon Tenya တွင် စားဖိုမှူး/အစားအသောက်ပြင်ဆင်သူအဖြစ် (၈) လ၊ Hotel Monterey တွင် ဟိုတယ်ဝန်ထမ်းအဖြစ် (၈) လ လုပ်ကိုင်ခဲ့ပါသည်။",

        job_3_role: "Telecom Operations Specialist",
        job_3_desc: "MPT/KDDI တွင် (၂) နှစ်ကြာ တာဝန်ထမ်းဆောင်ခဲ့သည်။ Customer Agent အဖြစ် (၁) နှစ်နှင့် SIM Data Validation Team (Data စိစစ်ရေး) တွင် (၁) နှစ် လုပ်ကိုင်ခဲ့ဖူးပါသည်။",

        edu_1_degree: "ဝိဇ္ဇာဘွဲ့ (နိုင်ငံတကာ ဆက်ဆံရေးပညာ)",
        edu_1_school: "ဒဂုံတက္ကသိုလ်",
        edu_2_degree: "ဂျပန်ဘာသာ ဒီပလိုမာ",
        edu_2_school: "Well Japanese Language School",

        blog_section_title: "ခရီးသွားမှတ်တမ်း",
        kyoto_title: "ကျိုတိုမြို့: ရှေးဟောင်းအငွေ့အသက်နှင့် အလှတရား",
        location: "ကျိုတို၊ ဂျပန်",
        kyoto_intro: "ကျိုတိုမြို့ဆိုတာ ဂျပန်နိုင်ငံရဲ့ ရှေးဟောင်းယဉ်ကျေးမှုတွေ စုဝေးရာ မြို့တော်ဟောင်းကြီး ဖြစ်ပါတယ်။",
        photo_1: "ဂီယွန် ရပ်ကွက်",
        photo_2: "ရွှေကျောင်းတော်",
        photo_3: "ဝါးတောလမ်း",
        photo_4: "ဆာကူရာ ရာသီ",
        kyoto_outro: "ခရီးသွားရတာ ပင်ပန်းပေမယ့် စိတ်ကြည်နူးစရာ ကောင်းပါတယ်။ ဆောင်းရာသီမှာ ထပ်သွားချင်ပါသေးတယ်။",
        footer_contact: "ဆက်သွယ်ရန်"
    },

    // --- Japanese ---
    jp: {
        nav_home: "ホーム",
        nav_about: "私について",
        nav_projects: "プロジェクト",
        nav_blog: "ブログ",
        nav_exploring: "探求", // (Tankyū - Exploration)


        Hero_hello: "こんにちは、私は",
        hero_desc: "ケア も コーディングもできるエンジニアです 🇯🇵",
        hero_sub: "介護職 | コンピュータサイエンス専攻の学生 | AIエンジニア志望 ＆ 情熱的なソフトウェア開発者",
        btn_view: "制作物を見る",

        // About Me / Profile
        about_title: "私について",
        about_bio_short: "日本在住。医療・介護分野からテック業界へ。現実世界の課題を解決するソフトウェアを開発しています。",
        about_slogan: "何事も、始めるのに遅すぎることはない",
        about_text_1: "日本在住。カフェインと尽きることのない学習意欲を原動力にしています。",
        about_text_2: "何事も、始めるのに遅すぎることはない。",
        about_text_3: "私の目標はAIエンジニアになることです。「恐ろしいほど有能なジェネラリスト（A Dangerously Capable Generalist）」として、様々な分野を探求しています。",


        project_title: "私のプロジェクト",
        proj_1_title: "Python 自動化",
        proj_1_desc: "日常業務を効率化するツール。",
        proj_2_title: "学習の記録",
        proj_2_desc: "大学の課題とWebデザイン集。",
        proj_3_title: "ポートフォリオ",
        proj_3_desc: "HTML, CSS, JSで作られたこのサイト。",

        nav_switch: "プロジェクト切替:",

        py_hero_title: "Python 自動化ラボ 🐍",
        py_hero_desc: "退屈な日常業務を自動化するスクリプトソリューション。",
        py_stack_title: "技術スタック",
        py_proj_title: "注目のスクリプト",
        py_p1_title: "Excelレポート自動入力",
        py_p1_desc: "CSVデータを使用して月次介護レポートを自動入力します。",
        py_p2_title: "シフトスケジュール整形",
        py_p2_desc: "複雑なシフトメールをGoogleカレンダー形式に変換します。",
        py_p3_title: "ニューススクレイパー",
        py_p3_desc: "日本のITニュースを収集し、Line/Telegramに送信します。",

        edu_hero_title: "知識は力なり 📚",
        edu_hero_desc: "NCCディプロマ、AI資格、そして独学の道のり。",
        edu_current_title: "現在のカリキュラム",
        edu_assignments_title: "課題の紹介",
        edu_c1_title: "NCC L4 コンピューティング・ディプロマ",
        edu_c2_title: "IBM AI 開発者プロフェッショナル",
        edu_c3_title: "フルスタック開発",

        port_hero_title: "点と点を繋ぐ 🌐",
        port_hero_desc: "国際関係学からITの世界へ。適応と成長の物語。",
        port_work_title: "職務経歴",
        port_edu_title: "学歴",

        job_1_role: "介護スタッフ (正社員)",
        job_1_desc: "現在、平島病院に勤務。日本の医療現場にて、思いやり、忍耐力、そして異文化コミュニケーション能力を培いました。",

        job_2_role: "ホスピタリティ＆運営業務 (アルバイト)",
        job_2_desc: "日本語学校に通いながら、天丼てんやでの調理・仕込み（8ヶ月）や、ホテルモントレ・ラスール大阪での客室清掃（8ヶ月）を経験しました。",

        job_3_role: "通信オペレーション・スペシャリスト",
        job_3_desc: "MPT/KDDIにて重要な役割を担いました。カスタマーエージェントとして1年、SIMデータ検証チームにて大規模なユーザーデータの精度管理を1年担当しました。",

        edu_1_degree: "学士号（国際関係学）",
        edu_1_school: "ダゴン大学（ミャンマー）",
        edu_2_degree: "日本語教育 ディプロマ",
        edu_2_school: "ウェル日本語学校",

        blog_section_title: "旅行日記",
        kyoto_title: "京都：伝統と美の調和",
        location: "日本、京都",
        kyoto_intro: "京都は日本の文化的な首都です。金閣寺から嵐山の竹林まで、至る所に歴史が息づいています。",
        photo_1: "祇園",
        photo_2: "金閣寺",
        photo_3: "嵐山の竹林",
        photo_4: "桜の季節",
        kyoto_outro: "旅行は少し疲れましたが、リフレッシュできました。次は冬に行きたいです。",
        footer_contact: "お問い合わせ"
    },

    // --- Vietnamese (Tiếng Việt) ---
    vn: {
        nav_home: "Trang chủ",
        nav_about: "Giới thiệu",
        nav_projects: "Dự án",
        nav_blog: "Blog",
        nav_exploring: "Khám phá",


        Hero_hello: "Xin chào, tôi là",
        hero_desc: "Tôi có thể Chăm sóc (Care) và cũng có thể Lập trình (Code) 🇯🇵",
        hero_sub: "Điều dưỡng viên | Sinh viên Khoa học Máy tính | Kỹ sư AI tương lai & Lập trình viên Phần mềm đam mê",
        btn_view: "Xem Dự án của Tôi",

        // About Me / Profile
        about_title: "Tôi là ai?",
        about_bio_short: "Đang sống tại Nhật Bản. Từ ngành Y tế chuyển sang Công nghệ. Tôi xây dựng phần mềm để giải quyết các vấn đề thực tế.",
        about_slogan: "Muộn còn hơn không bao giờ",
        about_text_1: "Đang sống tại Nhật Bản. Được tiếp sức bởi caffeine và niềm đam mê học hỏi không ngừng.",
        about_text_2: "Muộn còn hơn không bao giờ.",
        about_text_3: "Mục tiêu của tôi là trở thành Kỹ sư AI. Tôi đang khám phá nhiều lĩnh vực khác nhau với tư cách là một 'Generalist xuất sắc và đa năng' (A Dangerously Capable Generalist).",

        project_title: "Dự án của tôi",
        proj_1_title: "Tự động hóa Python",
        proj_1_desc: "Công cụ hỗ trợ công việc hàng ngày.",
        proj_2_title: "Học tập cá nhân",
        proj_2_desc: "Tuyển tập các bài tập đại học và thiết kế web.",
        proj_3_title: "Portfolio cá nhân",
        proj_3_desc: "Trang web này được xây dựng bằng HTML, CSS và JS.",

        nav_switch: "Dự án khác:",

        py_hero_title: "Phòng thí nghiệm Python 🐍",
        py_hero_desc: "Giải pháp kịch bản để tự động hóa các công việc nhàm chán.",
        py_stack_title: "Công nghệ & Thư viện",
        py_proj_title: "Kịch bản nổi bật",
        py_p1_title: "Tự động điền báo cáo Excel",
        py_p1_desc: "Tự động điền báo cáo chăm sóc hàng tháng bằng dữ liệu CSV.",
        py_p2_title: "Định dạng lịch làm việc",
        py_p2_desc: "Chuyển đổi email lịch làm việc lộn xộn sang định dạng Google Calendar.",
        py_p3_title: "Trình thu thập tin tức",
        py_p3_desc: "Thu thập tin tức CNTT Nhật Bản và gửi tóm tắt đến Line/Telegram.",

        edu_hero_title: "Kiến thức là sức mạnh 📚",
        edu_hero_desc: "Hành trình qua Văn bằng NCC, Chứng chỉ AI và Tự học.",
        edu_current_title: "Chương trình học hiện tại",
        edu_assignments_title: "Trưng bày bài tập",
        edu_c1_title: "Văn bằng NCC L4 về Điện toán",
        edu_c2_title: "Chuyên gia phát triển AI của IBM",
        edu_c3_title: "Phát triển Full Stack",

        port_hero_title: "Kết nối những điểm chấm 🌐",
        port_hero_desc: "Từ Quan hệ Quốc tế đến Công nghệ. Câu chuyện về sự thích nghi và phát triển của tôi.",
        port_work_title: "Kinh nghiệm làm việc",
        port_edu_title: "Nền tảng giáo dục",

        job_1_role: "Nhân viên Kaigo (Toàn thời gian)",
        job_1_desc: "Hiện đang làm việc tại Bệnh viện Hirashima. Phát triển sự đồng cảm, kiên nhẫn và kỹ năng giao tiếp đa văn hóa trong môi trường y tế Nhật Bản.",

        job_2_role: "Nhân viên Vận hành & Nhà hàng (Bán thời gian)",
        job_2_desc: "Cân bằng giữa công việc và học tập tại Nhật Bản. Có kinh nghiệm làm Đầu bếp/Chuẩn bị thực phẩm tại Tendon Tenya (8 tháng) và Dọn phòng tại Khách sạn Monterey La Soeur Osaka (8 tháng).",

        job_3_role: "Chuyên viên Vận hành Viễn thông",
        job_3_desc: "Đóng vai trò quan trọng tại MPT/KDDI. Làm việc 1 năm với tư cách là Tổng đài viên và 1 năm trong Đội Xác thực Dữ liệu SIM, xử lý độ chính xác của dữ liệu người dùng quy mô lớn.",

        edu_1_degree: "Cử nhân (Quan hệ Quốc tế)",
        edu_1_school: "Đại học Dagon, Myanmar",
        edu_2_degree: "Văn bằng Tiếng Nhật",
        edu_2_school: "Trường Nhật ngữ Well",

        blog_section_title: "Nhật ký du lịch",
        kyoto_title: "Kyoto: Nơi truyền thống gặp gỡ vẻ đẹp",
        location: "Kyoto, Nhật Bản",
        kyoto_intro: "Kyoto là thủ đô văn hóa của Nhật Bản. Từ Chùa Vàng đến Rừng Tre, mọi ngóc ngách đều kể lại lịch sử.",
        photo_1: "Quận Gion",
        photo_2: "Chùa Vàng",
        photo_3: "Rừng Tre",
        photo_4: "Mùa hoa anh đào",
        kyoto_outro: "Đi du lịch rất sảng khoái. Tôi hy vọng sẽ trở lại vào mùa đông.",
        footer_contact: "Liên hệ"
    },

    // --- Nepali (नेपाली) ---
    ne: {
        nav_home: "गृहपृष्ठ",
        nav_about: "मेरो बारेमा",
        nav_projects: "परियोजनाहरू",
        nav_blog: "ब्लग",
        nav_exploring: "अन्वेषण", // (Anveshan)


        Hero_hello: "नमस्ते, म",
        hero_desc: "म हेरचाह (Care) गर्न सक्छु र कोड (Code) पनि लेख्न सक्छु 🇯🇵",
        hero_sub: "हेरचाहकर्ता | कम्प्युटर विज्ञानको विद्यार्थी | भविष्यको एआई इन्जिनियर र उत्साही सफ्टवेयर विकासकर्ता",
        btn_view: "मेरा कामहरू हेर्नुहोस्",

        // About Me / Profile
        about_title: "म को हुँ?",
        about_bio_short: "जापानमा बस्दैछु। स्वास्थ्य सेवाबाट प्रविधि क्षेत्रमा। म वास्तविक संसारका समस्याहरू समाधान गर्न सफ्टवेयर निर्माण गर्छु।",
        about_slogan: "कहिल्यै नगर्नु भन्दा ढिलो गर्नु बेस",
        about_text_1: "जापानमा बस्दैछु। क्याफिन र सिक्ने अनन्त उत्सुकताबाट प्रेरित छु।",
        about_text_2: "कहिल्यै नगर्नु भन्दा ढिलो गर्नु बेस।",
        about_text_3: "मेरो लक्ष्य एआई (AI) इन्जिनियर बन्नु हो। म एक 'खतरनाक रूपमा सक्षम बहुमुखी व्यक्ति' (A Dangerously Capable Generalist) को रूपमा विभिन्न क्षेत्रहरूको खोजी गर्दैछु।",


        project_title: "मेरो परियोजनाहरू",
        proj_1_title: "Python स्वचालन",
        proj_1_desc: "दैनिक कार्यहरूमा मद्दत गर्ने उपकरणहरू।",
        proj_2_title: "व्यक्तिगत अध्ययन",
        proj_2_desc: "विश्वविद्यालय असाइनमेन्ट र वेब डिजाइनहरूको संग्रह।",
        proj_3_title: "व्यक्तिगत पोर्टफोलियो",
        proj_3_desc: "यो वेबसाइट HTML, CSS र JS द्वारा निर्मित।",

        nav_switch: "परियोजना परिवर्तन:",

        py_hero_title: "Python स्वचालन प्रयोगशाला 🐍",
        py_hero_desc: "बोरिंग दैनिक कार्यहरू स्वचालित गर्ने समाधानहरू।",
        py_stack_title: "प्राविधिक स्ट्याक",
        py_proj_title: "विशेष स्क्रिप्टहरू",
        py_p1_title: "Excel रिपोर्ट अटो-फिलर",
        py_p1_desc: "CSV डाटा प्रयोग गरी मासिक हेरचाह रिपोर्टहरू स्वचालित रूपमा भर्छ।",
        py_p2_title: "सिफ्ट तालिका फर्म्याटर",
        py_p2_desc: "अव्यवस्थित सिफ्ट इमेलहरूलाई Google क्यालेन्डर ढाँचामा रूपान्तरण गर्छ।",
        py_p3_title: "दैनिक समाचार स्क्रैपर",
        py_p3_desc: "जापान IT समाचार स्क्रैप गर्छ र Line/Telegram मा पठाउँछ।",

        edu_hero_title: "ज्ञान शक्ति हो 📚",
        edu_hero_desc: "NCC डिप्लोमा, AI प्रमाणपत्र, र स्वयं अध्ययन मार्फत मेरो यात्रा।",
        edu_current_title: "हालको पाठ्यक्रम",
        edu_assignments_title: "असाइनमेन्ट प्रदर्शन",
        edu_c1_title: "कम्प्युटिङमा NCC L4 डिप्लोमा",
        edu_c2_title: "IBM AI विकासकर्ता प्रोफेशनल",
        edu_c3_title: "Full Stack विकास",

        port_hero_title: "बिन्दुहरू जोड्दै 🌐",
        port_hero_desc: "अन्तर्राष्ट्रिय सम्बन्ध देखि प्राविधिक सम्म। मेरो अनुकूलन र विकासको कथा।",
        port_work_title: "व्यावसायिक अनुभव",
        port_edu_title: "शैक्षिक पृष्ठभूमि",

        job_1_role: "केयरगिभर कर्मचारी (पूर्ण समय)",
        job_1_desc: "हाल हिराशिमा अस्पतालमा कार्यरत। जापानी चिकित्सा वातावरणमा समानुभूति, धैर्य र अन्तर-सांस्कृतिक संचार कौशल विकास गरेको छु।",

        job_2_role: "आतिथ्य र सञ्चालन सहयोगी",
        job_2_desc: "जापानमा काम र पढाइ सन्तुलन। टेन्डन टेन्यामा किचन सेफ/फूड प्रेप (८ महिना) र होटल मोन्टेरे ला सोउर ओसाकामा हाउसकीपिङ (८ महिना) को अनुभव।",

        job_3_role: "दूरसञ्चार सञ्चालन विशेषज्ञ",
        job_3_desc: "MPT/KDDI संयुक्त सञ्चालनमा मुख्य भूमिका निर्वाह। १ वर्ष ग्राहक एजेन्ट अपरेटर र १ वर्ष SIM डाटा प्रमाणीकरण टोलीमा ठूलो मात्रामा प्रयोगकर्ता डाटा शुद्धता ह्यान्डल गरेको छु।",

        edu_1_degree: "ब्याचलर अफ आर्ट्स (अन्तर्राष्ट्रिय सम्बन्ध)",
        edu_1_school: "डागन विश्वविद्यालय, म्यानमार",
        edu_2_degree: "जापानी भाषा डिप्लोमा",
        edu_2_school: "वेल जापानी भाषा स्कूल",

        blog_section_title: "यात्रा डायरी",
        kyoto_title: "क्योटो: जहाँ परम्परा सुन्दरतालाई भेट्छ",
        location: "क्योटो, जापान",
        kyoto_intro: "क्योटो जापानको सांस्कृतिक राजधानी हो। मन्दिर र बाँसको जंगल घुम्नु अनिवार्य छ।",
        photo_1: "गियन जिल्ला",
        photo_2: "गोल्डेन प्याभिलियन",
        photo_3: "बाँसको जंगल",
        photo_4: "साकुरा सिजन",
        kyoto_outro: "यात्रा रमाइलो थियो। म जाडोमा फेरि जान चाहन्छु।",
        footer_contact: "सम्पर्क गर्नुहोस्"
    },

    // --- Indonesian (Bahasa Indonesia) ---
    id: {
        nav_home: "Beranda",
        nav_about: "Tentang",
        nav_projects: "Proyek",
        nav_blog: "Blog",
        nav_exploring: "Eksplorasi",


        Hero_hello: "Halo, saya",
        hero_desc: "Saya Bisa Merawat (Care) dan Juga Bisa Mengoding (Code) 🇯🇵",
        hero_sub: "Perawat | Mahasiswa Ilmu Komputer | Calon Insinyur AI & Pengembang Perangkat Lunak yang Bersemangat",
        btn_view: "Lihat Karya Saya",

        // About Me / Profile
        about_title: "Siapa Saya?",
        about_bio_short: "Tinggal di Jepang. Dari Kesehatan ke Teknologi. Saya membangun perangkat lunak untuk menyelesaikan masalah dunia nyata.",
        about_slogan: "Lebih Baik Terlambat Daripada Tidak Sama Sekali",
        about_text_1: "Tinggal di Jepang. Digerakkan oleh kafein dan rasa ingin tahu yang tak ada habisnya untuk belajar.",
        about_text_2: "Lebih Baik Terlambat Daripada Tidak Sama Sekali.",
        about_text_3: "Tujuan saya adalah menjadi Insinyur AI. Saya sedang menjelajahi berbagai bidang sebagai 'Generalis yang Sangat Mumpuni' (A Dangerously Capable Generalist).",


        project_title: "Proyek Saya",
        proj_1_title: "Otomasi Python",
        proj_1_desc: "Alat untuk membantu tugas sehari-hari.",
        proj_2_title: "Studi Pribadi",
        proj_2_desc: "Kumpulan tugas universitas dan desain web.",
        proj_3_title: "Portfolio Pribadi",
        proj_3_desc: "Situs web ini dibuat dengan HTML, CSS, dan JS.",

        nav_switch: "Ganti Proyek:",

        py_hero_title: "Lab Otomasi Python 🐍",
        py_hero_desc: "Solusi skrip untuk mengotomatisasi tugas harian yang membosankan.",
        py_stack_title: "Teknologi & Pustaka",
        py_proj_title: "Skrip Unggulan",
        py_p1_title: "Pengisi Laporan Excel",
        py_p1_desc: "Mengisi laporan perawatan bulanan secara otomatis menggunakan data CSV.",
        py_p2_title: "Pemformat Jadwal Shift",
        py_p2_desc: "Mengubah email jadwal shift yang berantakan menjadi format Google Kalender.",
        py_p3_title: "Pengikis Berita Harian",
        py_p3_desc: "Mengambil berita IT Jepang dan mengirimkan ringkasan ke Line/Telegram.",

        edu_hero_title: "Pengetahuan adalah Kekuatan 📚",
        edu_hero_desc: "Melacak perjalanan saya melalui Diploma NCC, Sertifikasi AI, dan Belajar Mandiri.",
        edu_current_title: "Kurikulum Saat Ini",
        edu_assignments_title: "Pameran Tugas",
        edu_c1_title: "Diploma NCC L4 Komputasi",
        edu_c2_title: "Profesional Pengembang AI IBM",
        edu_c3_title: "Pengembangan Full Stack",

        port_hero_title: "Menghubungkan Titik-titik 🌐",
        port_hero_desc: "Dari Hubungan Internasional ke Teknologi. Cerita saya tentang adaptasi dan pertumbuhan.",
        port_work_title: "Pengalaman Profesional",
        port_edu_title: "Latar Belakang Pendidikan",

        job_1_role: "Staf Kaigo (Penuh Waktu)",
        job_1_desc: "Saat ini bekerja di Rumah Sakit Hirashima. Mengembangkan empati, kesabaran, dan keterampilan komunikasi lintas budaya yang kuat di lingkungan medis Jepang.",

        job_2_role: "Rekanan Operasional & Perhotelan",
        job_2_desc: "Menyeimbangkan kerja dan studi di Jepang. Berpengalaman sebagai Koki/Persiapan Makanan di Tendon Tenya (8 bulan) dan Housekeeping di Hotel Monterey La Soeur Osaka (8 bulan).",

        job_3_role: "Spesialis Operasi Telekomunikasi",
        job_3_desc: "Memainkan peran kunci di Operasi Gabungan MPT/KDDI. Bertugas 1 tahun sebagai Operator Agen Pelanggan dan 1 tahun di Tim Validasi Data SIM, menangani akurasi data pengguna skala besar.",

        edu_1_degree: "Sarjana Seni (Hubungan Internasional)",
        edu_1_school: "Universitas Dagon, Myanmar",
        edu_2_degree: "Diploma Bahasa Jepang",
        edu_2_school: "Sekolah Bahasa Jepang Well",

        blog_section_title: "Buku Harian Perjalanan",
        kyoto_title: "Kyoto: Tradisi Bertemu Keindahan",
        location: "Kyoto, Jepang",
        kyoto_intro: "Kyoto adalah ibu kota budaya Jepang. Setiap sudut menceritakan sejarah.",
        photo_1: "Distrik Gion",
        photo_2: "Paviliun Emas",
        photo_3: "Hutan Bambu",
        photo_4: "Musim Sakura",
        kyoto_outro: "Bepergian itu melelahkan tapi menyegarkan. Saya ingin berkunjung lagi di musim dingin.",
        footer_contact: "Hubungi Saya"
    }
};



// Python Page Start ===========================================
// 3. Translation Logic Function
// ===========================================

function changeLang(lang) {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');

        // Check whether that key exists in the dictionary
        if (translations[lang] && translations[lang][key]) {
            element.innerText = translations[lang][key];
        }
    });

    // Font change for Myanmar (Optional styling tweak)
    if (lang === 'mm') {
        document.body.style.fontFamily = "'Padauk', 'Segoe UI', sans-serif";
    } else {
        document.body.style.fontFamily = "'Segoe UI', sans-serif";
    }

    // Save language preference to LocalStorage
    localStorage.setItem('myPortfolioLang', lang);
}

// Load saved language on startup
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('myPortfolioLang') || 'en';
    changeLang(savedLang);
});




// Monthly Digital Gallery Section Start ==================================

// ===========================================
// ===========================================
// Seasonal Lens Gallery Logic (Auto Scroll + Mouse Drag) Start
// =============================================================

document.addEventListener("DOMContentLoaded", () => {
    const dialTrack = document.getElementById('dialTrack');
    const lensCarousel = document.getElementById('lensCarousel');
    const cards = document.querySelectorAll('.lens-card');

    // 1. Create the ticks (scale lines)
    const totalTicks = 12 * 5;
    for (let i = 0; i < totalTicks + 5; i++) {
        const tick = document.createElement('div');
        tick.classList.add('tick');
        if (i % 5 === 0) {
            tick.classList.add('major');
        }
        dialTrack.appendChild(tick);
    }

    // 2. Dial scroll logic (moving the dial moves the images too)
    dialTrack.addEventListener('scroll', () => {
        const maxDialScroll = dialTrack.scrollWidth - dialTrack.clientWidth;
        const scrollRatio = dialTrack.scrollLeft / maxDialScroll;
        const maxCarouselScroll = lensCarousel.scrollWidth - lensCarousel.clientWidth;

        lensCarousel.scrollLeft = scrollRatio * maxCarouselScroll;
        updateActiveCard();
    });

    function updateActiveCard() {
        const centerPoint = lensCarousel.scrollLeft + (lensCarousel.clientWidth / 2);
        cards.forEach(card => {
            const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
            if (Math.abs(centerPoint - cardCenter) < 100) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // 3. Mouse drag logic (dragging the dial by hand)
    let isDown = false;
    let startX, scrollLeft;

    dialTrack.addEventListener('mousedown', (e) => {
        isDown = true;
        dialTrack.classList.add('active');
        startX = e.pageX - dialTrack.offsetLeft;
        scrollLeft = dialTrack.scrollLeft;
    });
    dialTrack.addEventListener('mouseleave', () => { isDown = false; dialTrack.classList.remove('active'); });
    dialTrack.addEventListener('mouseup', () => { isDown = false; dialTrack.classList.remove('active'); });
    dialTrack.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - dialTrack.offsetLeft;
        const walk = (x - startX) * 2;
        dialTrack.scrollLeft = scrollLeft - walk;
    });

    // 4. Carousel drag logic (dragging the images by hand)
    let isCarouselDown = false;
    let cStartX, cScrollLeft;

    lensCarousel.addEventListener('mousedown', (e) => {
        isCarouselDown = true;
        lensCarousel.classList.add('active');
        cStartX = e.pageX - lensCarousel.offsetLeft;
        cScrollLeft = lensCarousel.scrollLeft;
    });
    lensCarousel.addEventListener('mouseleave', () => { isCarouselDown = false; lensCarousel.classList.remove('active'); });
    lensCarousel.addEventListener('mouseup', () => { isCarouselDown = false; lensCarousel.classList.remove('active'); });
    lensCarousel.addEventListener('mousemove', (e) => {
        if (!isCarouselDown) return;
        e.preventDefault();
        const x = e.pageX - lensCarousel.offsetLeft;
        const walk = (x - cStartX) * 2;
        lensCarousel.scrollLeft = cScrollLeft - walk;
        // When the carousel moves, sync the dial to it
        const maxC = lensCarousel.scrollWidth - lensCarousel.clientWidth;
        const ratio = lensCarousel.scrollLeft / maxC;
        dialTrack.scrollLeft = ratio * (dialTrack.scrollWidth - dialTrack.clientWidth);
    });

    // ===========================================
    // 5. Auto-scroll logic (automatic movement)
    // ===========================================
    let autoScrollSpeed = 1; // 0.5 = slow, 2 = fast
    let isHovering = false;

    // Pause on mouse hover
    const section = document.querySelector('.lens-section');
    section.addEventListener('mouseenter', () => isHovering = true);
    section.addEventListener('mouseleave', () => isHovering = false);

    function autoLoop() {
        // Only move when the mouse isn't pressed or hovering
        if (!isDown && !isCarouselDown && !isHovering) {

            dialTrack.scrollLeft += autoScrollSpeed;

            // Loop back to the start when reaching the end (reset)
            if (dialTrack.scrollLeft >= (dialTrack.scrollWidth - dialTrack.clientWidth - 2)) {
                dialTrack.scrollLeft = 0;
            }
        }
        requestAnimationFrame(autoLoop); // Keep looping continuously
    }

    // Start auto-scroll
    autoLoop();

});
// Seasonal Lens Gallery Logic (Auto Scroll + Mouse Drag) END
// ============================================================

// Monthly digital Gallery section End ======================================




// 1. Article data (a small in-file database)


const diaryData = {
    // 1. KYOTO
    'kyoto': {
        // Hero image (top-of-page image)
        img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80",

        // Album images (add them all here once — shared across every language)
        gallery: [
            "https://media.istockphoto.com/id/538810794/photo/pristine-bamboo-forest-at-sunrise.jpg?s=612x612&w=0&k=20&c=SvLGK2UlJVI3DCADeqqJrwg0JWuOIAtlxMduQWrCQng=",
            "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?w=400&q=80",
            "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=80",
            "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=400&q=80"
        ],

        // Per-language text
        en: {
            title: "Kyoto: The Timeless City",
            date: "JAN 15, 2026",
            content: `
                <p>Kyoto is the heart of Japan's tradition. As I walked through the Gion district, the sound of wooden sandals clicking on the pavement took me back in time.</p>
                <p>The Golden Pavilion (Kinkaku-ji) reflected perfectly on the pond. It wasn't just a building; it was a testament to the meticulous nature of Japanese architecture.</p>
                <h3 class="gallery-title">📸 Photo Highlights</h3>
                <div class="insert-gallery"></div> <p><strong>Highlights:</strong> <br>• Bamboo Forest at sunrise.<br>• Matcha tea ceremony.<br>• The silent beauty of Zen gardens.</p>
            `
        },
        mm: {
            title: "ကျိုတိုမြို့: ရှေးဟောင်းအငွေ့အသက်နှင့် အလှတရား",
            date: "ဇန်နဝါရီ ၁၅၊ ၂၀၂၆",
            content: `
                <p>ကျိုတိုမြို့သည် ဂျပန်နိုင်ငံ၏ ရိုးရာယဉ်ကျေးမှု အသည်းနှလုံးဖြစ်ပါသည်။ ဂီယွန် (Gion) ရပ်ကွက်ထဲ လမ်းလျှောက်လိုက်သည့်အခါ သစ်သားဖိနပ်သံ တဒေါက်ဒေါက်က ရှေးခေတ်ကာလတစ်ခုဆီ ခေါ်ဆောင်သွားသလို ခံစားရပါသည်။</p>
                <p>ရွှေကျောင်းတော် (Kinkaku-ji) ၏ ပုံရိပ်သည် ရေကန်မျက်နှာပြင်ပေါ်တွင် ထင်ဟပ်နေသည်မှာ အလွန်လက်ရာမြောက်လှပါသည်။</p>
                <h3 class="gallery-title">📸 မှတ်တမ်းဓာတ်ပုံများ</h3>
                <div class="insert-gallery"></div>
                <p><strong>ထူးခြားချက်များ:</strong> <br>• နေထွက်ချိန် ဝါးတောလမ်း<br>• ရိုးရာ လက်ဖက်ရည်ပွဲ<br>• ငြိမ်းချမ်းလှသော ဂျပန်ဥယျာဉ်များ</p>
            `
        },
        jp: {
            title: "京都：伝統と美の調和",
            date: "2026年1月15日",
            content: `
                <p>京都は日本の伝統の中心地です。祇園を歩くと、下駄の音が響き、まるでタイムスリップしたような気分になります。</p>
                <p>金閣寺が池に映る姿は完璧で、日本建築の緻密さを証明しています。</p>
                <h3 class="gallery-title">📸 写真ハイライト</h3>
                <div class="insert-gallery"></div>
                <p><strong>見どころ:</strong> <br>• 日の出の嵐山竹林<br>• 抹茶体験<br>• 静寂な禅の庭</p>
            `
        },
        vn: {
            title: "Kyoto: Thành phố vượt thời gian",
            date: "15 Tháng 1, 2026",
            content: `
                <p>Kyoto là trái tim của truyền thống Nhật Bản. Khi đi dạo qua quận Gion, tiếng guốc gỗ vang lên đưa tôi trở về quá khứ.</p>
                <h3 class="gallery-title">📸 Hình ảnh nổi bật</h3>
                <div class="insert-gallery"></div>
                <p><strong>Điểm nhấn:</strong> <br>• Rừng tre lúc bình minh<br>• Trà đạo</p>
            `
        },
        ne: {
            title: "क्योटो: अनन्त सहर",
            date: "१५ जनवरी २०२६",
            content: `
                <p>क्योटो जापानी परम्पराको मुटु हो। गियन जिल्लामा हिड्दा काठको जुत्ताको आवाजले मलाई इतिहासमा फिर्ता लग्यो।</p>
                <h3 class="gallery-title">📸 तस्बिर झलकहरू</h3>
                <div class="insert-gallery"></div>
                <p><strong>विशेषताहरु:</strong> <br>• बाँसको वन<br>• माचा चिया समारोह</p>
            `
        },
        id: {
            title: "Kyoto: Kota Tak Lekang Waktu",
            date: "15 Jan 2026",
            content: `
                <p>Kyoto adalah jantung tradisi Jepang. Berjalan di distrik Gion membawa saya kembali ke masa lalu.</p>
                <h3 class="gallery-title">📸 Sorotan Foto</h3>
                <div class="insert-gallery"></div>
                <p><strong>Sorotan:</strong> <br>• Hutan Bambu saat matahari terbit<br>• Upacara minum teh</p>
            `
        }
    },

    // 2. OSAKA
    'osaka': {
        img: "https://resources.matcha-jp.com/original/2019/08/06-83115.jpeg",
        gallery: [
            "https://th.bing.com/th/id/R.b5e1d5175c9a372df3baa430d3f8dcd1?rik=p9ue3%2bYoAyWikQ&riu=http%3a%2f%2fanekatempatwisata.com%2fwp-content%2fuploads%2f2017%2f01%2fDotonbori.jpg&ehk=JbGecfn7s2DCdwm%2fw7aWGKNX%2f7qGvQdcQvmZdPaGlvI%3d&risl=&pid=ImgRaw&r=0",
            "https://images.unsplash.com/photo-1554797589-7241bb691973?q=80&w=1000&auto=format&fit=crop",
            "https://static.vecteezy.com/system/resources/previews/008/641/906/large_2x/osaka-castle-in-autumn-foliage-season-is-a-famous-japanese-castle-landmark-and-popular-for-tourist-attractions-in-osaka-kansai-japan-photo.jpg",
            "https://i.ytimg.com/vi/g8XCnt7r3Zc/maxresdefault.jpg"
        ],
        en: {
            title: "Osaka: Neon Lights & Food",
            date: "FEB 02, 2026",
            content: `
                <p>If Kyoto is the heart of tradition, Osaka is the soul of modern energy. Dotonbori at night is a sensory overload.</p>
                <p>I tried Takoyaki and Okonomiyaki. The flavors were bold, just like the people of Osaka.</p>
                <h3 class="gallery-title">🐙 Osaka Vibes</h3>
                <div class="insert-gallery"></div>
                <p><strong>Must Try:</strong><br>• Takoyaki (Octopus Balls)<br>• Okonomiyaki<br>• Kushikatsu</p>
            `
        },
        mm: {
            title: "အိုဆာကာ: နီယွန်မီးများနှင့် အစားအသောက်",
            date: "ဖေဖော်ဝါရီ ၂၊ ၂၀၂၆",
            content: `
                <p>ကျိုတိုက ရိုးရာဆန်တယ်ဆိုရင်၊ အိုဆာကာကတော့ ခေတ်မီပြီး သက်ဝင်လှုပ်ရှားနေတဲ့ မြို့ကြီးပါ။ ဒိုတွန်ဘိုရိ (Dotonbori) ရဲ့ ညဘက်မြင်ကွင်းက အရမ်းလှပပါတယ်။</p>
                <p>လမ်းဘေးဆိုင်က တကိုယာကီ နဲ့ အိုကိုနိုမိယာကီကို စမ်းစားကြည့်ခဲ့ပါတယ်။ အရသာက ရှယ်ပါပဲ။</p>
                <h3 class="gallery-title">🐙 အိုဆာကာ မြင်ကွင်းများ</h3>
                <div class="insert-gallery"></div>
                <p><strong>စားဖြစ်အောင်စားပါ:</strong><br>• တကိုယာကီ (ရေဘဝဲလုံး)<br>• အိုကိုနိုမိယာကီ (ဂျပန်ပန်ကိတ်)</p>
            `
        },
        jp: {
            title: "大阪：ネオンと食の街",
            date: "2026年2月2日",
            content: `
                <p>京都が伝統なら、大阪は現代のエネルギーです。夜の道頓堀は圧倒的です。</p>
                <h3 class="gallery-title">🐙 大阪の雰囲気</h3>
                <div class="insert-gallery"></div>
                <p><strong>必食:</strong><br>• たこ焼き<br>• お好み焼き<br>• 串カツ</p>
            `
        },
        vn: {
            title: "Osaka: Ánh đèn Neon & Ẩm thực",
            date: "02 Tháng 2, 2026",
            content: `
                <p>Nếu Kyoto là trái tim của truyền thống, Osaka là linh hồn của năng lượng hiện đại.</p>
                <h3 class="gallery-title">🐙 Cảm xúc Osaka</h3>
                <div class="insert-gallery"></div>
            `
        },
        ne: {
            title: "ओसाका: नियोन लाइट्स र खाना",
            date: "२ फेब्रुअरी २०२६",
            content: `
                <p>यदि क्योटो परम्पराको मुटु हो भने, ओसाका आधुनिक ऊर्जाको आत्मा हो।</p>
                <h3 class="gallery-title">🐙 ओसाका भाइब्स</h3>
                <div class="insert-gallery"></div>
            `
        },
        id: {
            title: "Osaka: Lampu Neon & Makanan",
            date: "02 Feb 2026",
            content: `
                <p>Jika Kyoto adalah jantung tradisi, Osaka adalah jiwa energi modern.</p>
                <h3 class="gallery-title">🐙 Suasana Osaka</h3>
                <div class="insert-gallery"></div>
            `
        }
    },

    // 3. THOUGHTS (Solitude)
    'thoughts': {
        img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80",
            "https://th.bing.com/th/id/R.aa10f29783018f11a02f666ecb983e8e?rik=K0CDKZSNbMdIGQ&riu=http%3a%2f%2fja.best-wallpaper.net%2fwallpaper%2f1920x1080%2f1408%2fTemple-pavilion-Kyoto-Japan-trees-lake_1920x1080.jpg&ehk=LXbm8M3Mib5KZjvlZPYsWNeoG7gcQyOPMZuYR8O2eL4%3d&risl=&pid=ImgRaw&r=0",
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80"
        ],
        en: {
            title: "Solitude in Nature",
            date: "MARCH 10, 2026",
            content: `
                <p>Sometimes, coding and debugging can be overwhelming. Taking a break to visit the mountains near Sanda was refreshing.</p>
                <p>Hiking alone gives you time to reflect. The silence of the forest feels alive.</p>
                <h3 class="gallery-title">🌲 Nature & Peace</h3>
                <div class="insert-gallery"></div>
                <p>Nature reminds us that not everything needs to be optimized.</p>
            `
        },
        mm: {
            title: "သဘာဝတရားနှင့် တိတ်ဆိတ်ငြိမ်သက်ခြင်း",
            date: "မတ်လ ၁၀၊ ၂၀၂၆",
            content: `
                <p>တစ်ခါတစ်လေ Coding ရေးရတာ၊ Debugging လုပ်ရတာတွေက စိတ်ဖိစီးစရာ ကောင်းပါတယ်။ Sanda မြို့နားက တောင်တန်းတွေဆီ အလည်သွားတာက စိတ်ကြည်နူးစရာပါ။</p>
                <p>တစ်ယောက်တည်း တောင်တက်တာက ကိုယ့်ကိုယ်ကို ပြန်သုံးသပ်ဖို့ အချိန်ရစေပါတယ်။</p>
                <h3 class="gallery-title">🌲 သဘာဝတရား၏ ငြိမ်းချမ်းမှု</h3>
                <div class="insert-gallery"></div>
                <p>အရာအားလုံးကို Optimize လုပ်နေစရာမလိုကြောင်း သဘာဝတရားက သွန်သင်ပေးပါတယ်။</p>
            `
        },
        jp: {
            title: "自然の中の孤独",
            date: "2026年3月10日",
            content: `
                <p>コーディングやデバッグは時に圧倒されることがあります。三田近くの山へ行くのは良い気分転換になりました。</p>
                <h3 class="gallery-title">🌲 自然と平和</h3>
                <div class="insert-gallery"></div>
            `
        },
        vn: {
            title: "Sự cô đơn giữa thiên nhiên",
            date: "10 Tháng 3, 2026",
            content: `
                <p>Đôi khi, việc viết mã và sửa lỗi có thể quá sức. Nghỉ ngơi và thăm những ngọn núi gần Sanda thật sảng khoái.</p>
                <h3 class="gallery-title">🌲 Thiên nhiên & Bình yên</h3>
                <div class="insert-gallery"></div>
            `
        },
        ne: {
            title: "प्रकृतिमा एकान्त",
            date: "१० मार्च २०२६",
            content: `
                <p>कहिलेकाहीँ कोडिङ र डिबगिङ गाह्रो हुन सक्छ। सान्डा नजिकैका पहाडहरू भ्रमण गर्नु स्फूर्तिदायी थियो।</p>
                <h3 class="gallery-title">🌲 प्रकृति र शान्ति</h3>
                <div class="insert-gallery"></div>
            `
        },
        id: {
            title: "Kesendirian di Alam",
            date: "10 Mar 2026",
            content: `
                <p>Terkadang, coding dan debugging bisa sangat melelahkan. Beristirahat mengunjungi pegunungan dekat Sanda sangat menyegarkan.</p>
                <h3 class="gallery-title">🌲 Alam & Kedamaian</h3>
                <div class="insert-gallery"></div>
            `
        }
    },

    // 4. KAIGO (assumes the HTML key 'kaigo')
    'kaigo-experience': {
        img: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80",
        gallery: [
            "https://tse1.explicit.bing.net/th/id/OIP.cQQcjwBHYX9S2J2JyD_iiwHaEa?rs=1&pid=ImgDetMain&o=7&rm=3",
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80",
            "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80",
            "https://closler.org/wp-content/uploads/2018/08/teamwork-hands.png"
        ],
        en: {
            title: "Life of Care Giver (Kaigo)",
            date: "APRIL 10, 2026",
            content: `
                <p>Life is not ever easy, you just need to keep patient and resilience.</p>
                <p>Working in a Japanese hospital has taught me the true meaning of empathy and cross-cultural communication.</p>
                <p>Language barriers were hard at first, but a smile is a universal language.</p>
                <h3 class="gallery-title">🏥 Moments of Care</h3>
                <div class="insert-gallery"></div>
                <p><strong>Key Lessons:</strong> Patience, Empathy, and the value of human connection.</p>
            `
        },
        mm: {
            title: "ပြုစုစောင့်ရှောက်သူ (Kaigo) ဘဝ",
            date: "ဧပြီ ၁၀၊ ၂၀၂၆",
            content: `
                <p>ဘဝက ဘယ်တော့မှ မလွယ်ကူပါဘူး။ သည်းခံမှုနဲ့ ကြံ့ခိုင်မှု ရှိဖို့ပဲ လိုပါတယ်။</p>
                <p>ဂျပန်ဆေးရုံမှာ အလုပ်လုပ်ရတာက ကိုယ်ချင်းစာတရားနဲ့ ယဉ်ကျေးမှုမတူသူတွေကြား ဆက်ဆံရေးအကြောင်း ကောင်းကောင်း သင်ပေးပါတယ်။</p>
                <p>ဘာသာစကား အခက်အခဲရှိပေမယ့် အပြုံးကတော့ လူတိုင်းနားလည်တဲ့ ဘာသာစကားတစ်ခုပါ။</p>
                <h3 class="gallery-title">🏥 ပြုစုစောင့်ရှောက်မှု မြင်ကွင်းများ</h3>
                <div class="insert-gallery"></div>
                <p><strong>သင်ခန်းစာများ:</strong> သည်းခံခြင်း၊ ကိုယ်ချင်းစာခြင်း နှင့် လူသားချင်း စာနာခြင်း။</p>
            `
        },
        jp: {
            title: "介護士としての生活",
            date: "2026年4月10日",
            content: `
                <p>人生は決して簡単ではありません。忍耐と回復力を持ち続ける必要があります。</p>
                <p>日本の病院で働くことで、共感と異文化コミュニケーションの本当の意味を学びました。</p>
                <h3 class="gallery-title">🏥 介護の瞬間</h3>
                <div class="insert-gallery"></div>
                <p><strong>学んだこと:</strong> 忍耐、共感、そして人との繋がりの大切さ。</p>
            `
        },
        vn: {
            title: "Cuộc sống của người chăm sóc (Kaigo)",
            date: "10 Tháng 4, 2026",
            content: `
                <p>Cuộc sống không bao giờ dễ dàng, bạn chỉ cần kiên nhẫn và kiên cường.</p>
                <p>Làm việc tại bệnh viện Nhật Bản đã dạy cho tôi ý nghĩa thực sự của sự đồng cảm.</p>
                <h3 class="gallery-title">🏥 Khoảnh khắc chăm sóc</h3>
                <div class="insert-gallery"></div>
            `
        },
        ne: {
            title: "केयर गिभर (Kaigo) को जीवन",
            date: "१० अप्रिल २०२६",
            content: `
                <p>जीवन कहिल्यै सजिलो हुँदैन, तपाईंले मात्र धैर्य र लचिलोपन राख्नु पर्छ।</p>
                <p>जापानी अस्पतालमा काम गर्दा मैले समानुभूतिको वास्तविक अर्थ सिकेँ।</p>
                <h3 class="gallery-title">🏥 हेरचाहका क्षणहरू</h3>
                <div class="insert-gallery"></div>
            `
        },
        id: {
            title: "Kehidupan Perawat (Kaigo)",
            date: "10 Apr 2026",
            content: `
                <p>Hidup tidak pernah mudah, Anda hanya perlu bersabar dan tangguh.</p>
                <p>Bekerja di rumah sakit Jepang telah mengajarkan saya arti sebenarnya dari empati.</p>
                <h3 class="gallery-title">🏥 Momen Perawatan</h3>
                <div class="insert-gallery"></div>
            `
        }
    }
};

// ===========================================
// Dynamic Article Loader Logic (Gallery Auto-Inject) 
// ===========================================

function openArticle(id) {
    // 1. Find the data by ID
    const locationData = diaryData[id];

    if (!locationData) {
        console.error("No data found for ID:", id);
        return;
    }

    // 2. Read the current language from localStorage
    // (Default: 'en')
    const currentLang = localStorage.getItem('myPortfolioLang') || 'en';

    // 3. Pull out the text for that language
    // (fall back to English if that language is missing)
    const contentData = locationData[currentLang] || locationData['en'];

    // 4. Inject the static data (image, date, title)
    document.getElementById('modalImg').style.backgroundImage = `url('${locationData.img}')`;
    document.getElementById('modalDate').innerText = contentData.date;
    document.getElementById('modalTitle').innerText = contentData.title;

    // 5. Inject the content HTML
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = contentData.content;

    // 6. Gallery injection logic (auto-insert images)
    // Find <div class="insert-gallery"></div> in the HTML
    const galleryPlaceholder = modalContent.querySelector('.insert-gallery');

    // Only run when both the placeholder and gallery images exist
    if (galleryPlaceholder && locationData.gallery && locationData.gallery.length > 0) {

        // Create the gallery container
        const galleryContainer = document.createElement('div');
        galleryContainer.className = 'article-gallery';

        // Loop over each image and add it
        locationData.gallery.forEach(imgSrc => {
            const imgTag = document.createElement('img');
            imgTag.src = imgSrc;
            imgTag.className = 'gallery-img';
            imgTag.alt = "Gallery Image"; // For accessibility
            galleryContainer.appendChild(imgTag);
        });

        // Replace the placeholder with the real gallery
        galleryPlaceholder.replaceWith(galleryContainer);
    }

    // 7. Show the modal
    document.getElementById('articleModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeArticle() {
    document.getElementById('articleModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}


// Travel Diary Modal Logic (Professional Multi-Language & Gallery System) End 
// ==============================================================================
// ==============================================================================


// The Best Snow Effect (Using Official Preset)
// Snowfall effect (uses a preset for a more natural look)

// The Best Snow Effect (Final Fixed Version)
// Snowfall effect (bundle version)

tsParticles.load("tsparticles", {
    particles: {
        number: {
            value: 50, // Number of snowflakes
            density: {
                enable: true,
                area: 800
            }
        },
        color: {
            value: "#87CEFA" // Snowflake colour
        },
        shape: {
            type: "circle" // Circle
        },
        opacity: {
            value: 0.5,
            random: true, // Fades in and out
            anim: {
                enable: false
            }
        },
        size: {
            value: 4,
            random: true, // Vary the sizes
            anim: {
                enable: false
            }
        },
        move: {
            enable: true,
            speed: 2, // Falling speed
            direction: "bottom", // Falls downward
            random: false,
            straight: false, // Falls with a gentle sway
            out_mode: "out",
            attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        events: {
            onhover: {
                enable: false // No hover interaction (keep it simple)
            },
            onclick: {
                enable: false
            },
            resize: true
        }
    },
    retina_detect: true,
    background: {
        color: "transparent" // Transparent background
    }
});











