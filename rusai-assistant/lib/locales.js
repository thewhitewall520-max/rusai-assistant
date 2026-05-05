// Server-side locale loader for lang/[code].js

const localeMap = {
  ru: './locales/ru.json',
  ja: './locales/ja.json',
  ko: './locales/ko.json',
  fr: './locales/fr.json',
  de: './locales/de.json',
  es: './locales/es.json',
  pt: './locales/pt.json',
  it: './locales/it.json',
  th: './locales/th.json',
  vi: './locales/vi.json',
  en: './locales/en.json',
  'zh-CN': './locales/zh-CN.json',
}

const NATIVE_NAMES = {
  ru: 'Русский', ja: '日本語', ko: '한국어', fr: 'Français',
  de: 'Deutsch', es: 'Español', pt: 'Português', it: 'Italiano',
  th: 'ไทย', vi: 'Tiếng Việt', en: 'English', 'zh-CN': '中文',
}

const FLAGS = {
  ru: '🇷🇺', ja: '🇯🇵', ko: '🇰🇷', fr: '🇫🇷', de: '🇩🇪',
  es: '🇪🇸', pt: '🇵🇹', it: '🇮🇹', th: '🇹🇭', vi: '🇻🇳',
  en: '🇺🇸', 'zh-CN': '🇨🇳',
}

function getLocale(code) {
  let langCode = code
  // Map ru -> ru.json, etc.
  if (!localeMap[code]) {
    langCode = 'en'
  }
  try {
    return require(localeMap[langCode])
  } catch (e) {
    return null
  }
}

function getLangName(code) {
  return NATIVE_NAMES[code] || code
}

function getFlag(code) {
  return FLAGS[code] || '🌐'
}

module.exports = { getLocale, getLangName, getFlag, localeMap }
