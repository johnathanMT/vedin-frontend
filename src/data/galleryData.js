// ============================================================================
//  galleryData.js — SINGLE SOURCE OF TRUTH for the Memory Gallery (metadata only).
//
//  Images live in  src/assets/images/gallery/  and are bundled + content-hashed
//  by Vite via import.meta.glob in GallerySection.jsx (automatic cache-busting).
//
//  To add a photo:
//    1. Drop the image into  src/assets/images/gallery/  (jpg/png/webp — NOT heic)
//    2. Add ONE entry below whose `file` matches the filename exactly.
//
//  `alt` and `caption` are i18n objects ({ en, mm, jp, ... }). Only `en` is
//  required — GallerySection falls back to `en` for any missing language.
//  Captions are PLACEHOLDERS — edit freely; the layout won't change.
//
//  TWO FOLDERS DECIDE WHERE A PHOTO SHOWS (no flags needed):
//    • src/assets/images/highlights/  → homepage HEXAGON grid.
//    • src/assets/images/gallery/     → dedicated /gallery PAGE.
//    Want a photo in both? Put a copy in each folder.
//
//  METADATA FIELDS (optional, matched by `file` name — applies in either folder):
//    • date    — strict 'YYYY-MM-DD'. Drives the chronological sort (newest
//                first) AND the /gallery section grouping. Always include it.
//    • moment  — the event/chapter name, e.g. 'Relocation', 'Work Life',
//                'Travel'. With the date's month+year it forms a section title
//                like "August 2024 — Work Life".
//  (dates below are GUESSES — edit them to your real timeline; the gallery
//   re-sorts and re-groups automatically.)
//
//  ── HOW TO ADD A PHOTO ──────────────────────────────────────────────────────
//    1. Drop the image in highlights/ (hexagons) and/or gallery/ (full page).
//    2. Add ONE entry below whose `file` matches the filename exactly:
//         {
//           id: 'unique-id',
//           file: 'my-photo.webp',
//           date: '2025-07-14',          // YYYY-MM-DD — controls sort + group
//           moment: 'Travel',            // section name on the gallery page
//           alt:     { en: 'Alt text' },
//           caption: { en: 'Caption', mm: '...', jp: '...' },
//         }
// ============================================================================

export const GALLERY = [
  {
    id: 'graduation',
    file: 'graduation.webp',
    date: '2022-03-20',
    moment: 'Graduation',
    alt: { en: 'Graduation day' },
    caption: { en: 'Graduation Day', mm: 'ဘွဲ့ယူနေ့', jp: '卒業の日' },
  },
  {
    id: 'mtn-desk',
    file: 'mtn_deskN.webp',
    date: '2024-06-10',
    moment: 'Work Life',
    alt: { en: 'At my workstation' },
    caption: { en: 'My Workstation', mm: 'ကျွန်ုပ်၏ အလုပ်ခုံ', jp: '僕のワークステーション' },
  },
  {
    id: 'mtn-namba',
    file: 'mtn_namba.webp',
    date: '2024-09-05',
    moment: 'Work Life',
    alt: { en: 'Namba district, Osaka' },
    caption: { en: 'Namba, Osaka', mm: 'နန်ဘ၊ အိုဆာကာ', jp: '難波・大阪' },
  },
  {
    id: 'osaka-ai',
    file: 'osaka_ai.webp',
    date: '2025-04-12',
    moment: 'Travel',
    alt: { en: 'Osaka' },
    caption: { en: 'Osaka Vibes', mm: 'အိုဆာကာ', jp: '大阪の風景' },
  },
  // NOTE: no 'mtn_zoo.webp' file exists in gallery/ yet — entry disabled to
  // avoid dead metadata. Drop the file in and uncomment to restore it.
  // {
  //   id: 'mtn-zoo',
  //   file: 'mtn_zoo.webp',
  //   date: '2025-05-03',
  //   moment: 'Travel',
  //   alt: { en: 'A day at the zoo' },
  //   caption: { en: 'At the Zoo', jp: '<japanese>', mm: '<burmese>' },
  // },
  {
    id: 'mtn-tarot',
    file: 'mtn_tarrot.webp',
    date: '2024-11-22',
    moment: 'Work Life',
    alt: { en: 'Tarot and fortune' },
    caption: { en: 'Tarot & Fortune', mm: 'တာရော့ဟောကိန်း', jp: 'タロット占い' },
  },
  {
    id: 'mtn-longhair',
    file: 'mtn_longhair.jpg', // was .webp — the actual file is .jpg
    date: '2021-08-01',
    moment: 'Throwback',
    alt: { en: 'Throwback portrait' },
    caption: { en: 'Throwback', mm: 'အတိတ်အမှတ်တရ', jp: '思い出の一枚' },
  },
  {
    id: 'zawgyi',
    file: 'zawgyi.webp',
    date: '2022-01-15',
    moment: 'Relocation',
    alt: { en: 'Zawgyi — Burmese alchemist figure' },
    caption: { en: 'Zawgyi', mm: 'ဇော်ဂျီ', jp: 'ゾージー' },
  },
  // ════════════════════════════════════════════════════════════════════════
  //  SCAFFOLDED ENTRIES — files already in gallery/ that had no metadata yet.
  //  TODO for each: set the real `date` ('YYYY-MM-DD') and `moment`; tweak the
  //  caption/alt. Until `date` is filled, they appear under "Undated — <moment>"
  //  at the end of the /gallery page (captions still work).
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'nomura-sasayama',
    file: 'mtn&nomura_sasayama.jpg',
    date: '', // TODO: YYYY-MM-DD
    moment: 'Travel',
    alt: { en: 'Sasayama with Nomura' },
    caption: { en: 'Sasayama' },
  },
  {
    id: 'billet',
    file: 'mtn_billet.jpg',
    date: '', // TODO: YYYY-MM-DD
    moment: 'Moments',
    alt: { en: 'Billet' },
    caption: { en: 'Billet' },
  },
  {
    id: 'boar',
    file: 'mtn_boar.webp',
    date: '', // TODO: YYYY-MM-DD
    moment: 'Moments',
    alt: { en: 'Boar' },
    caption: { en: 'Boar' },
  },
  {
    id: 'couple-wrun',
    file: 'mtn_couple_wrun.webp',
    date: '', // TODO: YYYY-MM-DD
    moment: 'Moments',
    alt: { en: 'Couple' },
    caption: { en: 'Together' },
  },
  {
    id: 'cyc-outdoor',
    file: 'mtn_cycoutdoor.jpg',
    date: '', // TODO: YYYY-MM-DD
    moment: 'Outdoors',
    alt: { en: 'Cycling outdoors' },
    caption: { en: 'Cycling Outdoors' },
  },
  {
    id: 'iconsiam',
    file: 'mtn_iconsiam.webp',
    date: '', // TODO: YYYY-MM-DD
    moment: 'Travel',
    alt: { en: 'IconSiam, Bangkok' },
    caption: { en: 'IconSiam, Bangkok' },
  },
  {
    id: 'jobless-days',
    file: 'mtn_jobless3jpg.jpg',
    date: '', // TODO: YYYY-MM-DD
    moment: 'Throwback',
    alt: { en: 'Job-hunting days' },
    caption: { en: 'Jobless Days' },
  },
  {
    id: 'laptop',
    file: 'mtn_laptop.webp',
    date: '', // TODO: YYYY-MM-DD
    moment: 'Work Life',
    alt: { en: 'With my laptop' },
    caption: { en: 'With My Laptop' },
  },

  // ── Add new photos here ↓ (drop the file in highlights/ and/or gallery/ first) ──
  // { id: 'unique-id', file: 'my-photo.webp', date: '2025-07-14', moment: 'Travel',
  //   alt: { en: 'Alt text' }, caption: { en: 'Caption', mm: '...', jp: '...' } },
]
