// 語言映射表（ISO 639-1 → 語言名稱）
const LANG_NAMES = {
  zh: '中文', en: 'English', ru: 'Русский', ja: '日本語', ko: '한국어',
  fr: 'Français', de: 'Deutsch', es: 'Español', pt: 'Português', it: 'Italiano',
  ar: 'العربية', hi: 'हिन्दी', bn: 'বাংলা', pa: 'ਪੰਜਾਬੀ', ta: 'தமிழ்',
  th: 'ไทย', vi: 'Tiếng Việt', ms: 'Bahasa Melayu', id: 'Bahasa Indonesia',
  tl: 'Filipino', my: 'မြန်မာဘာသာ', km: 'ភាសាខ្មែរ', lo: 'ລາວ', mn: 'Монгол',
  ne: 'नेपाली', si: 'සිංහල', ur: 'اردو', fa: 'فارسی', he: 'עברית',
  tr: 'Türkçe', kk: 'Қазақ', uz: 'Oʻzbek', ky: 'Кыргызча', tg: 'Тоҷикӣ',
  az: 'Azərbaycan', hy: 'Հայերեն', ka: 'ქართული', el: 'Ελληνικά',
  pl: 'Polski', cs: 'Čeština', sk: 'Slovenčina', hu: 'Magyar',
  ro: 'Română', bg: 'Български', sr: 'Српски', hr: 'Hrvatski',
  sl: 'Slovenščina', et: 'Eesti', lv: 'Latviešu', lt: 'Lietuvių',
  uk: 'Українська', be: 'Беларуская', nl: 'Nederlands', sv: 'Svenska',
  no: 'Norsk', da: 'Dansk', fi: 'Suomi', is: 'Íslenska', ga: 'Gaeilge',
  sw: 'Kiswahili', ha: 'Hausa', yo: 'Yorùbá', ig: 'Igbo', zu: 'isiZulu',
  af: 'Afrikaans', am: 'አማርኛ', so: 'Soomaali',
}

const LANGUAGES = Object.entries(LANG_NAMES).map(([code, name]) => ({ code, name }))

export { LANG_NAMES, LANGUAGES }
