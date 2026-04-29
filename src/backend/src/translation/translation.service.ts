import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private openai: OpenAI;

  // 支持的语言列表
  readonly supportedLanguages = [
    { code: 'zh', name: '中文', nameEn: 'Chinese', flag: '🇨🇳' },
    { code: 'en', name: '英语', nameEn: 'English', flag: '🇬🇧' },
    { code: 'ru', name: '俄语', nameEn: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: '日语', nameEn: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: '韩语', nameEn: 'Korean', flag: '🇰🇷' },
    { code: 'fr', name: '法语', nameEn: 'French', flag: '🇫🇷' },
    { code: 'de', name: '德语', nameEn: 'German', flag: '🇩🇪' },
    { code: 'es', name: '西班牙语', nameEn: 'Spanish', flag: '🇪🇸' },
    { code: 'pt', name: '葡萄牙语', nameEn: 'Portuguese', flag: '🇵🇹' },
    { code: 'it', name: '意大利语', nameEn: 'Italian', flag: '🇮🇹' },
    { code: 'ar', name: '阿拉伯语', nameEn: 'Arabic', flag: '🇸🇦', rtl: true },
    { code: 'he', name: '希伯来语', nameEn: 'Hebrew', flag: '🇮🇱', rtl: true },
    { code: 'nl', name: '荷兰语', nameEn: 'Dutch', flag: '🇳🇱' },
    { code: 'sv', name: '瑞典语', nameEn: 'Swedish', flag: '🇸🇪' },
    { code: 'pl', name: '波兰语', nameEn: 'Polish', flag: '🇵🇱' },
    { code: 'cs', name: '捷克语', nameEn: 'Czech', flag: '🇨🇿' },
    { code: 'tr', name: '土耳其语', nameEn: 'Turkish', flag: '🇹🇷' },
    { code: 'fa', name: '波斯语', nameEn: 'Persian', flag: '🇮🇷', rtl: true },
    { code: 'th', name: '泰语', nameEn: 'Thai', flag: '🇹🇭' },
    { code: 'vi', name: '越南语', nameEn: 'Vietnamese', flag: '🇻🇳' },
    { code: 'id', name: '印尼语', nameEn: 'Indonesian', flag: '🇮🇩' },
    { code: 'hi', name: '印地语', nameEn: 'Hindi', flag: '🇮🇳' },
    { code: 'bn', name: '孟加拉语', nameEn: 'Bengali', flag: '🇧🇩' },
    { code: 'uk', name: '乌克兰语', nameEn: 'Ukrainian', flag: '🇺🇦' },
    { code: 'ro', name: '罗马尼亚语', nameEn: 'Romanian', flag: '🇷🇴' },
    { code: 'el', name: '希腊语', nameEn: 'Greek', flag: '🇬🇷' },
    { code: 'hu', name: '匈牙利语', nameEn: 'Hungarian', flag: '🇭🇺' },
    { code: 'fi', name: '芬兰语', nameEn: 'Finnish', flag: '🇫🇮' },
    { code: 'no', name: '挪威语', nameEn: 'Norwegian', flag: '🇳🇴' },
    { code: 'da', name: '丹麦语', nameEn: 'Danish', flag: '🇩🇰' },
    { code: 'sk', name: '斯洛伐克语', nameEn: 'Slovak', flag: '🇸🇰' },
    { code: 'bg', name: '保加利亚语', nameEn: 'Bulgarian', flag: '🇧🇬' },
    { code: 'hr', name: '克罗地亚语', nameEn: 'Croatian', flag: '🇭🇷' },
    { code: 'sr', name: '塞尔维亚语', nameEn: 'Serbian', flag: '🇷🇸' },
    { code: 'lt', name: '立陶宛语', nameEn: 'Lithuanian', flag: '🇱🇹' },
    { code: 'lv', name: '拉脱维亚语', nameEn: 'Latvian', flag: '🇱🇻' },
    { code: 'et', name: '爱沙尼亚语', nameEn: 'Estonian', flag: '🇪🇪' },
    { code: 'sl', name: '斯洛文尼亚语', nameEn: 'Slovenian', flag: '🇸🇮' },
    { code: 'mk', name: '马其顿语', nameEn: 'Macedonian', flag: '🇲🇰' },
    { code: 'sq', name: '阿尔巴尼亚语', nameEn: 'Albanian', flag: '🇦🇱' },
    { code: 'ka', name: '格鲁吉亚语', nameEn: 'Georgian', flag: '🇬🇪' },
    { code: 'hy', name: '亚美尼亚语', nameEn: 'Armenian', flag: '🇦🇲' },
    { code: 'az', name: '阿塞拜疆语', nameEn: 'Azerbaijani', flag: '🇦🇿' },
    { code: 'uz', name: '乌兹别克语', nameEn: 'Uzbek', flag: '🇺🇿' },
    { code: 'kk', name: '哈萨克语', nameEn: 'Kazakh', flag: '🇰🇿' },
    { code: 'mn', name: '蒙古语', nameEn: 'Mongolian', flag: '🇲🇳' },
    { code: 'ne', name: '尼泊尔语', nameEn: 'Nepali', flag: '🇳🇵' },
    { code: 'si', name: '僧伽罗语', nameEn: 'Sinhala', flag: '🇱🇰' },
    { code: 'ta', name: '泰米尔语', nameEn: 'Tamil', flag: '🇮🇳' },
    { code: 'te', name: '泰卢固语', nameEn: 'Telugu', flag: '🇮🇳' },
    { code: 'mr', name: '马拉地语', nameEn: 'Marathi', flag: '🇮🇳' },
    { code: 'gu', name: '古吉拉特语', nameEn: 'Gujarati', flag: '🇮🇳' },
    { code: 'pa', name: '旁遮普语', nameEn: 'Punjabi', flag: '🇮🇳' },
    { code: 'ml', name: '马拉雅拉姆语', nameEn: 'Malayalam', flag: '🇮🇳' },
    { code: 'kn', name: '卡纳达语', nameEn: 'Kannada', flag: '🇮🇳' },
    { code: 'ur', name: '乌尔都语', nameEn: 'Urdu', flag: '🇵🇰', rtl: true },
    { code: 'ms', name: '马来语', nameEn: 'Malay', flag: '🇲🇾' },
    { code: 'tl', name: '他加禄语', nameEn: 'Tagalog', flag: '🇵🇭' },
    { code: 'sw', name: '斯瓦希里语', nameEn: 'Swahili', flag: '🇰🇪' },
    { code: 'af', name: '南非荷兰语', nameEn: 'Afrikaans', flag: '🇿🇦' },
  ];

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * 翻译文本
   */
  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<string> {
    if (sourceLang === targetLang) {
      return text;
    }

    const sourceLanguage = this.getLanguageName(sourceLang);
    const targetLanguage = this.getLanguageName(targetLang);

    const prompt = `请将以下${sourceLanguage}文本翻译成${targetLanguage}：

原文：
${text}

要求：
1. 保持原文的语气和风格
2. 确保翻译准确、自然
3. 专业术语保持一致
4. 如果是正式文本，使用正式用语

翻译：`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL', 'gpt-4'),
        messages: [
          {
            role: 'system',
            content: `你是一位专业的翻译专家，精通多种语言。你的翻译准确、自然，能够很好地传达原文的意思和风格。`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: parseInt(this.configService.get('OPENAI_MAX_TOKENS', '4000')),
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('Translation error:', error);
      throw new Error('翻译失败，请稍后重试');
    }
  }

  /**
   * 批量翻译
   */
  async translateBatch(
    texts: string[],
    sourceLang: string,
    targetLang: string,
  ): Promise<string[]> {
    const translations: string[] = [];
    
    for (const text of texts) {
      try {
        const translated = await this.translate(text, sourceLang, targetLang);
        translations.push(translated);
      } catch (error) {
        this.logger.error(`Failed to translate: ${text.substring(0, 50)}...`);
        translations.push(text); // 失败时返回原文
      }
    }
    
    return translations;
  }

  /**
   * 检测语言
   */
  async detectLanguage(text: string): Promise<string> {
    const prompt = `请检测以下文本的语言，只返回语言代码（如 zh, en, ru, ja 等）：

文本：${text.substring(0, 500)}

语言代码：`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 10,
        temperature: 0,
      });

      const detected = response.choices[0]?.message?.content?.trim().toLowerCase() || 'en';
      return this.normalizeLanguageCode(detected);
    } catch (error) {
      this.logger.error('Language detection error:', error);
      return 'en';
    }
  }

  /**
   * 获取语言列表
   */
  getSupportedLanguages() {
    return this.supportedLanguages.map(lang => ({
      code: lang.code,
      name: lang.name,
      nameEn: lang.nameEn,
      flag: lang.flag,
      rtl: lang.rtl || false,
    }));
  }

  /**
   * 获取语言名称
   */
  private getLanguageName(code: string): string {
    const lang = this.supportedLanguages.find(l => l.code === code);
    return lang ? `${lang.name}(${lang.nameEn})` : code;
  }

  /**
   * 标准化语言代码
   */
  private normalizeLanguageCode(code: string): string {
    const normalized = code.toLowerCase().trim();
    const supported = this.supportedLanguages.find(l => l.code === normalized);
    return supported ? supported.code : 'en';
  }
}